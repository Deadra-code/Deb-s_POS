import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the GAS API
        await page.route('**/macros/s/**', async route => {
            const postData = route.request().postData() || '';

            if (postData.includes('action=login')) {
                if (postData.includes('passcode') && postData.includes('123456')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ success: true, token: 'fake-token' })
                    });
                } else {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ success: false, error: 'Passcode salah' })
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

    test('should login successfully with valid passcode', async ({ page }) => {
        await page.goto('./');
        await page.getByPlaceholder('••••••').fill('123456');
        // Click login
        await page.getByText('Masuk Sekarang').click();

        // Verify navigation to dashboard - wait for app title
        await expect(page.locator('text=Deb\'s POS')).toBeVisible({ timeout: 15000 });
    });

    test('should show error on invalid passcode', async ({ page }) => {
        await page.goto('/');
        await page.getByPlaceholder('••••••').fill('wrong');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('text=Passcode salah')).toBeVisible();
    });
});
