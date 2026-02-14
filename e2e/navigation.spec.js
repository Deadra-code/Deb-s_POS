import { test, expect } from '@playwright/test';

test.describe('Responsive Layout & Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // Mock for navigation tests
        await page.route('**/macros/s/**', async route => {
            const postData = route.request().postData() || '';
            if (postData.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (postData.includes('action=getReport')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ transactions: [] }) });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });

        await page.goto('./');
        await page.getByPlaceholder('Username').fill('admin');
        await page.getByPlaceholder('Password').fill('admin');
        // Click login
        await page.getByText('Masuk Aplikasi').click();
        // Wait for app title to confirm login
        await expect(page.locator('text=Deb\'s Manager')).toBeVisible({ timeout: 15000 });
    });

    test('should handle desktop navigation', async ({ page, isMobile }) => {
        test.skip(isMobile, 'Desktop only');
        await expect(page.locator('text=Deb\'s Manager')).toBeVisible();
        await page.getByRole('button', { name: /Inventory/i }).click();
        await expect(page.locator('text=Manajemen Stok')).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile only');
        await expect(page.locator('text=Kasir')).toBeVisible();
        await page.getByText('Stok').click();
        await expect(page.locator('text=Manajemen Stok')).toBeVisible();
    });
});
