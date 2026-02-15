import { test, expect } from '@playwright/test';

test.describe('POS Transaction Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (url.includes('action=getMenu')) {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{ ID: '1', Nama_Menu: 'Kopi', Harga: '5000', Stock: 10, Kategori: 'Minuman' }])
                });
            } else if (url.includes('action=saveOrder')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
            } else if (url.includes('action=getReport')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ transactions: [] }) });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });

        await page.goto('./');
        await page.getByPlaceholder('••••••').fill('123456');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('h1, h2, span:visible').filter({ hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 });
    });

    test('should complete a full transaction', async ({ page, isMobile }) => {
        const posLabel = isMobile ? 'Kasir' : 'Point of Sales';
        await page.locator(`button:has-text("${posLabel}")`).first().click();

        await expect(page.locator('text=Kopi')).toBeVisible({ timeout: 10000 });
        await page.locator('text=Kopi').click();

        if (isMobile) {
            // Mobile: Click floating cart button then "Lanjut Bayar"
            await page.locator('button').filter({ hasText: /Rp/ }).filter({ visible: true }).first().click();
            await page.locator('button:has-text("Lanjut Bayar")').click();
        } else {
            // Desktop: Click "Proses Pembayaran" directly
            await page.locator('button:has-text("Proses Pembayaran")').click();
        }

        await expect(page.locator('text=Konfirmasi Pembayaran')).toBeVisible();
        await page.locator('button:has-text("Bayar via")').first().click();

        await expect(page.locator('text=Berhasil')).toBeVisible({ timeout: 10000 });
    });
});
