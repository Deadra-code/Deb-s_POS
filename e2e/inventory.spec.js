import { test, expect } from '@playwright/test';

test.describe('Inventory Management Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/macros/s/**', async route => {
            const url = route.request().url();
            if (url.includes('action=login')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'fake-token' }) });
            } else if (url.includes('action=getMenu')) {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{ ID: '1', Nama_Menu: 'Kopi', Harga: '5000', Modal: '3000', Stock: 10, Kategori: 'Minuman', _rowIndex: 2 }])
                });
            } else if (url.includes('action=saveProduct')) {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
            } else if (url.includes('action=deleteProduct')) {
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

    test('should add a new product', async ({ page, isMobile }) => {
        const inventoryLabel = isMobile ? 'Stok' : 'Inventory';
        await page.locator(`button:has-text("${inventoryLabel}")`).first().click();

        await expect(page.locator('h1, h2').filter({ hasText: 'Management Menu' }).first()).toBeVisible({ timeout: 15000 });
        await page.locator('button:has-text("Produk Baru")').first().click();

        // New product form
        await page.getByLabel('Nama Produk').fill('Teh Manis');
        await page.getByLabel('Kategori').selectOption('Minuman');
        await page.getByLabel('Harga Jual (Rp)').fill('3000');
        await page.getByLabel('Modal (Rp)').fill('1000');
        await page.getByLabel('Stok Awal').fill('50');

        await page.locator('button:has-text("Simpan Perubahan")').click();
        await expect(page.locator('text=Berhasil')).toBeVisible();
    });

    test('should edit an existing product', async ({ page, isMobile }) => {
        const inventoryLabel = isMobile ? 'Stok' : 'Inventory';
        await page.locator(`button:has-text("${inventoryLabel}")`).first().click();

        await expect(page.locator('h1, h2').filter({ hasText: 'Management Menu' }).first()).toBeVisible({ timeout: 15000 });

        // Use strict locator based on viewport to avoid ambiguity
        const productLocator = isMobile ? page.locator('h3').filter({ hasText: 'Kopi' }) : page.locator('td').filter({ hasText: 'Kopi' });
        await expect(productLocator.first()).toBeVisible({ timeout: 10000 });

        // Handle inconsistent aria-labels (Edit vs Edit produk) and ensure visibility
        await page.locator('button[aria-label^="Edit"]:visible').first().click();

        await page.getByLabel('Harga Jual (Rp)').fill('6000');
        await page.locator('button:has-text("Simpan Perubahan")').click();

        await expect(page.locator('text=Berhasil')).toBeVisible();
    });

    test('should delete a product', async ({ page, isMobile }) => {
        const inventoryLabel = isMobile ? 'Stok' : 'Inventory';
        await page.locator(`button:has-text("${inventoryLabel}")`).first().click();

        await expect(page.locator('h1, h2').filter({ hasText: 'Management Menu' }).first()).toBeVisible({ timeout: 15000 });

        const productLocator = isMobile ? page.locator('h3').filter({ hasText: 'Kopi' }) : page.locator('td').filter({ hasText: 'Kopi' });
        await expect(productLocator.first()).toBeVisible({ timeout: 10000 });

        page.on('dialog', dialog => dialog.accept());
        // Handle inconsistent aria-labels (Hapus vs Hapus produk) and ensure visibility
        await page.locator('button[aria-label^="Hapus"]:visible').first().click();

        await expect(page.locator('text=Berhasil')).toBeVisible();
    });
});
