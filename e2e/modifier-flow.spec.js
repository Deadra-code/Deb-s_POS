import { test, expect } from '@playwright/test';

test.describe('POS Modifier Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (url.includes('action=getMenu')) {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{
                        ID: 'v1',
                        Nama_Menu: 'Nasi Goreng Ayam',
                        Harga: '15000',
                        Varian: 'Level: Pedas, Sedang',
                        Kategori: 'Makanan'
                    }])
                });
            } else {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) });
            }
        });

        await page.goto('./');
        await page.getByPlaceholder('••••••').fill('123456');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('h1, h2, span:visible').filter({ hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 });
    });

    test('should allow selecting variants and add-ons', async ({ page, isMobile }) => {
        const posLabel = isMobile ? 'Kasir' : 'Point of Sales';
        await page.locator(`button:has-text("${posLabel}")`).first().click();

        await expect(page.getByText('Nasi Goreng Ayam')).toBeVisible({ timeout: 10000 });
        await page.getByText('Nasi Goreng Ayam').click();

        // Wait for modal
        await expect(page.getByText('Kustomisasi Pesanan')).toBeVisible();

        // Select variant (Level: Pedas)
        await page.locator('button:has-text("Pedas")').click();

        // Select Add-on (Telur Dadar)
        await page.locator('button:has-text("Telur Dadar")').click();

        // Add to cart
        await page.getByText('Tambahkan ke Keranjang').click();

        // Verify cart
        if (isMobile) {
            // Wait for modal to close
            await expect(page.getByText('Kustomisasi Pesanan')).not.toBeVisible();
            // Click the floating cart button
            await page.locator('button').filter({ hasText: /Rp/ }).filter({ visible: true }).first().click();
            await expect(page.getByText('Rincian Pesanan')).toBeVisible();
        }

        // Case-insensitive variants check
        await expect(page.getByText(/pedas/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/telur dadar/i)).toBeVisible({ timeout: 10000 });

        // Total check
        const totalLocator = page.locator('[data-testid="cart-total"]').filter({ visible: true }).first();
        await expect(totalLocator).toContainText('20.000');
    });
});
