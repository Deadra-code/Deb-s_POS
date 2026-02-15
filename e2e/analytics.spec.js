import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (url.includes('action=getReport')) {
                const mockTransactions = [
                    {
                        date: new Date().toISOString().split('T')[0],
                        total: 10000,
                        status: 'Selesai',
                        paymentMethod: 'Tunai',
                        owner: 'Debby',
                        items: [{ nama: 'Kopi', harga: 5000, qty: 2, modal: 2000, milik: 'Debby' }]
                    }
                ];
                await route.fulfill({ status: 200, body: JSON.stringify({ transactions: mockTransactions }) });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });

        await page.goto('./');
        await page.getByPlaceholder('••••••').fill('123456');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('h1, h2, span:visible').filter({ hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 });
    });

    test('should render dashboard data correctly', async ({ page, isMobile }) => {
        const dashboardLabel = isMobile ? 'Bisnis' : 'Dashboard';
        await page.locator(`button:has-text("${dashboardLabel}")`).first().click();

        await expect(page.locator('h1, h2').filter({ hasText: 'Dashboard' }).first()).toBeVisible();
        await expect(page.locator('text=Rp 10.000').first()).toBeVisible();
        await expect(page.locator('text=Rp 6.000').first()).toBeVisible();
    });

    test('should filter dashboard data by period', async ({ page, isMobile }) => {
        const dashboardLabel = isMobile ? 'Bisnis' : 'Dashboard';
        await page.locator(`button:has-text("${dashboardLabel}")`).first().click();

        const periodSelect = page.locator('select').first();
        await periodSelect.selectOption('TAHUN_INI');

        await expect(page.locator('h1, h2').filter({ hasText: 'Dashboard' }).first()).toBeVisible();
    });

    test('should filter dashboard data by owner', async ({ page, isMobile }) => {
        const dashboardLabel = isMobile ? 'Bisnis' : 'Dashboard';
        await page.locator(`button:has-text("${dashboardLabel}")`).first().click();

        const ownerSelect = page.locator('select').nth(1);
        await ownerSelect.selectOption('Debby');
        await expect(page.locator('text=Rp 10.000').first()).toBeVisible();

        await ownerSelect.selectOption('Mama');
        await expect(page.locator('text=Rp 0').first()).toBeVisible();
    });
});
