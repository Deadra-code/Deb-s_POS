import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                const postData = route.request().postData() || '';
                if (postData.includes('123456')) {
                    await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
                } else {
                    await route.fulfill({ status: 200, body: JSON.stringify({ success: false, error: 'Passcode salah' }) });
                }
            } else if (url.includes('action=getReport')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ transactions: [] }) });
            } else {
                await route.fulfill({ status: 200, body: '[]' });
            }
        });
    });

    test('should login successfully with valid passcode', async ({ page }) => {
        await page.goto('./');
        await page.getByPlaceholder('••••••').fill('123456');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('h1, h2, span:visible').filter({ hasText: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 });
    });

    test('should show error on invalid passcode', async ({ page }) => {
        await page.goto('/');
        await page.getByPlaceholder('••••••').fill('wrong');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('text=Passcode salah')).toBeVisible();
    });
});
