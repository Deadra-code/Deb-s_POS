import { test, expect } from '@playwright/test';

test.describe('Responsive Layout & Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
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

    test('should handle desktop navigation', async ({ page, isMobile }) => {
        test.skip(isMobile, 'Desktop only');
        await page.locator('button:has-text("Inventory")').first().click();
        await expect(page.locator('h1, h2').filter({ hasText: 'Management Menu' }).first()).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only');
        await page.locator('button:has-text("Stok")').first().click();
        await expect(page.locator('h1, h2').filter({ hasText: 'Management Menu' }).first()).toBeVisible();
    });
});
