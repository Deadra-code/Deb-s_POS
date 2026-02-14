import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the GAS API
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            const postData = route.request().postData() || '';

            if (postData.includes('action=login')) {
                if (postData.includes('admin') && postData.includes('admin')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ success: true, token: 'fake-token' })
                    });
                } else {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ success: false, error: 'Username atau Password salah' })
                    });
                }
            } else if (postData.includes('action=getReport')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ transactions: [] })
                });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });
    });

    test('should login successfully with admin credentials', async ({ page }) => {
        await page.goto('./');
        await page.getByPlaceholder('Username').fill('admin');
        await page.getByPlaceholder('Password').fill('admin');
        // Click login
        await page.getByText('Masuk Aplikasi').click();

        // Verify navigation to dashboard - wait for app title
        await expect(page.locator('text=Deb\'s Manager')).toBeVisible({ timeout: 15000 });
        // Look for the "Analisa performa bisnis" which is unique to dashboard
        await expect(page.locator('text=Analisa performa bisnis')).toBeVisible({ timeout: 10000 });
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('./');
        await page.getByPlaceholder('Username').fill('wrong');
        await page.getByPlaceholder('Password').fill('wrong');
        await page.getByText('Masuk Aplikasi').click();
        await expect(page.locator('text=Username atau Password salah')).toBeVisible();
    });
});
