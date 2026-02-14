import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { fetchData } from '../services/api';

// Integration test for the main workflow
vi.mock('../services/api', () => ({
    fetchData: vi.fn()
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
        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'admin' } });
        fireEvent.click(screen.getByText(/Masuk Aplikasi/i));

        // 3. Verify Landing on Dashboard
        await waitFor(() => {
            expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // 4. Navigate to POS (Point of Sales)
        fireEvent.click(screen.getByText(/Point of Sales/i));

        // 5. POS Page - Add item
        await waitFor(() => {
            expect(screen.getByText('Kopi')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Kopi'));

        // 6. Checkout
        // The button is in the desktop sidebar which should be visible now
        await waitFor(() => {
            const checkoutBtn = screen.getByText(/Bayar Sekarang/i);
            expect(checkoutBtn).toBeInTheDocument();
            fireEvent.click(checkoutBtn);
        });

        // 7. Verify saveOrder was called
        await waitFor(() => {
            expect(fetchData).toHaveBeenCalledWith('saveOrder', 'POST', expect.any(Object));
        });
    });
});
