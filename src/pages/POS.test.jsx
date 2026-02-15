import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import POS from './POS';

vi.mock('../services/api', () => ({
    fetchData: vi.fn(() => Promise.resolve({ success: true, data: [] }))
}));

const mockMenu = [
    { ID: '1', Nama_Menu: 'Nasi Goreng', Harga: 15000, Stock: 10, Kategori: 'Utama' },
    { ID: '2', Nama_Menu: 'Es Teh', Harga: 5000, Stock: 0, Kategori: 'Minuman' }
];

describe('POS Component', () => {
    const mockRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Force large screen for sidebar visibility
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
        window.dispatchEvent(new Event('resize'));
    });

    it('renders menu items', () => {
        render(<POS menu={mockMenu} refreshData={mockRefresh} />);
        expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
        expect(screen.getByText('Es Teh')).toBeInTheDocument();
    });

    it('adds item to cart when clicked', () => {
        render(<POS menu={mockMenu} refreshData={mockRefresh} />);

        // Select the item from the grid
        const item = screen.getByText('Nasi Goreng');
        fireEvent.click(item);

        // After clicking, it should appear in the cart. 
        // Usually there are at least two occurrences: one in the grid, one in the cart.
        const occurrences = screen.getAllByText('Nasi Goreng');
        expect(occurrences.length).toBeGreaterThan(1);
    });

    it('shows HABIS for items with no stock', () => {
        render(<POS menu={mockMenu} refreshData={mockRefresh} />);
        expect(screen.getByText('HABIS')).toBeInTheDocument();
    });

    it('updates total price when items are added', async () => {
        render(<POS menu={mockMenu} refreshData={mockRefresh} />);

        const item = screen.getByText('Nasi Goreng').closest('article');
        fireEvent.click(item);

        // Check total updates
        await waitFor(() => {
            const totalElements = screen.getAllByTestId('cart-total');
            const hasCorrectTotal = totalElements.some(el => el.textContent.includes('15.000') || el.textContent.includes('15,000'));
            expect(hasCorrectTotal).toBe(true);
        }, { timeout: 3000 });
    });
});
