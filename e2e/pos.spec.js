import { test, expect } from '@playwright/test';

test.describe('POS Transaction Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the GAS API
        await page.route('**/macros/s/**', async route => {
            const postData = route.request().postData() || '';
            if (postData.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (postData.includes('action=getMenu')) {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{ ID: '1', Nama_Menu: 'Kopi', Harga: '5000', Stock: 10, Kategori: 'Minuman' }])
                });
            } else if (postData.includes('action=saveOrder')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
            } else if (postData.includes('action=getReport')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ transactions: [] }) });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });

        // Login
        await page.goto('./');
        await page.getByPlaceholder('Username').fill('admin');
        await page.getByPlaceholder('Password').fill('admin');
        // Click login
        await page.getByText('Masuk Aplikasi').click();
        // Wait for app title to confirm login
        await expect(page.locator('text=Deb\'s Manager')).toBeVisible({ timeout: 15000 });
    });

    test('should complete a full transaction', async ({ page }) => {
        await page.getByRole('button', { name: /Point of Sales/i }).click();

        // Wait for mock data
        await expect(page.locator('text=Kopi')).toBeVisible({ timeout: 10000 });
        await page.locator('text=Kopi').click();

        // Checkout - ensure we are clicking the actual button
        const checkoutBtn = page.getByRole('button', { name: /Bayar Sekarang/i });
        await checkoutBtn.click();

        // Verify success toast
        await expect(page.locator('text=Berhasil! Transaksi telah disimpan')).toBeVisible({ timeout: 10000 });
    });
});
