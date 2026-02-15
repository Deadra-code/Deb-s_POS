import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { fetchData } from '../services/api';

// Integration test for the main workflow
vi.mock('../services/api', () => ({
    fetchData: vi.fn(),
    syncOfflineOrders: vi.fn()
}));

describe('Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock large screen to ensure Cart is visible in POS without toggle
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
    });

    it('completes a full checkout flow', async () => {
        // 1. Mock initial data and login
        fetchData.mockImplementation((action) => {
            if (action === 'login') return Promise.resolve({ success: true, token: 'fake-token' });
            if (action === 'getMenu') return Promise.resolve([{ ID: '1', Nama_Menu: 'Kopi', Harga: '5000', Stock: 10, Kategori: 'Minuman' }]);
            if (action === 'getOrders') return Promise.resolve([]);
            if (action === 'getInflow') return Promise.resolve([]);
            if (action === 'getReport') return Promise.resolve({ transactions: [] });
            if (action === 'saveOrder') return Promise.resolve({ success: true });
            return Promise.resolve([]);
        });

        render(<App />);

        // 2. Login Page
        fireEvent.change(screen.getByPlaceholderText(/••••••/i), { target: { value: '123456' } });
        fireEvent.click(screen.getByText(/Masuk Sekarang/i));

        // 3. Verify Landing on Dashboard
        await waitFor(() => {
            const dashboardElements = screen.getAllByText(/Deb's POS/i);
            expect(dashboardElements.length).toBeGreaterThan(0);
        }, { timeout: 3000 });

        // 4. Navigate to Point of Sales
        fireEvent.click(screen.getByText(/Point of Sales/i));

        // 5. POS Page - Add item
        await waitFor(() => {
            expect(screen.getByText('Kopi')).toBeInTheDocument();
        }, { timeout: 5000 });
        fireEvent.click(screen.getByText('Kopi'));

        // 6. Checkout
        await waitFor(() => {
            const checkoutBtn = screen.getByText(/Proses Pembayaran/i);
            expect(checkoutBtn).toBeInTheDocument();
            fireEvent.click(checkoutBtn);
        });

        // 7. Payment Modal
        await waitFor(() => {
            expect(screen.getByText(/Bayar via/i)).toBeInTheDocument();
        });

        // 8. Confirm Payment
        const payBtn = screen.getByText(/Bayar via/i);
        fireEvent.click(payBtn);

        // 9. Verify saveOrder was called
        await waitFor(() => {
            expect(fetchData).toHaveBeenCalledWith('saveOrder', 'POST', expect.any(Object));
        });
    });
});
