import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.addInitScript(() => {
            localStorage.clear();
        });
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/');
        
        // Check for login form elements
        await expect(page.getByPlaceholder('••••••')).toBeVisible();
        await expect(page.getByText('Masuk Sekarang')).toBeVisible();
    });

    test('should login successfully with default passcode', async ({ page }) => {
        await page.goto('/');
        
        // Enter default passcode (admin123 as per README)
        await page.getByPlaceholder('••••••').fill('admin123');
        await page.getByText('Masuk Sekarang').click();
        
        // Wait for navigation to dashboard
        await expect(page.locator('text=Dashboard, text=Point of Sales, text=Inventory').first()).toBeVisible({ timeout: 15000 });
    });

    test('should show error on invalid passcode', async ({ page }) => {
        await page.goto('/');
        
        await page.getByPlaceholder('••••••').fill('wrongpass');
        await page.getByText('Masuk Sekarang').click();
        
        // Should show error message
        await expect(page.locator('text=Passcode salah, text=Gagal login')).toBeVisible({ timeout: 5000 });
    });

    test('should toggle passcode visibility', async ({ page }) => {
        await page.goto('/');
        
        const passcodeInput = page.getByPlaceholder('••••••');
        const toggleButton = page.getByText('👁️');
        
        await passcodeInput.fill('test123');
        await expect(passcodeInput).toHaveAttribute('type', 'password');
        
        await toggleButton.click();
        await expect(passcodeInput).toHaveAttribute('type', 'text');
        
        await toggleButton.click();
        await expect(passcodeInput).toHaveAttribute('type', 'password');
    });

    test('should persist login after page refresh', async ({ page }) => {
        await page.goto('/');
        
        // Login
        await page.getByPlaceholder('••••••').fill('admin123');
        await page.getByText('Masuk Sekarang').click();
        
        // Wait for dashboard
        await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
        
        // Refresh page
        await page.reload();
        
        // Should still be logged in
        await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
    });

    test('should logout successfully', async ({ page }) => {
        await page.goto('/');
        
        // Login first
        await page.getByPlaceholder('••••••').fill('admin123');
        await page.getByText('Masuk Sekarang').click();
        await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
        
        // Logout (click logout button in mobile nav or sidebar)
        const logoutButton = page.getByText('Keluar').first();
        await logoutButton.click();
        
        // Should return to login page
        await expect(page.getByPlaceholder('••••••')).toBeVisible({ timeout: 5000 });
        
        // Token should be cleared
        const token = await page.evaluate(() => localStorage.getItem('POS_TOKEN'));
        expect(token).toBeNull();
    });
});
