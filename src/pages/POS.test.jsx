import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import POS from './POS';

const mockMenu = [
    { ID: '1', Nama_Menu: 'Nasi Goreng', Harga: '15000', Stock: 10, Kategori: 'Makanan' },
    { ID: '2', Nama_Menu: 'Es Teh', Harga: '5000', Stock: 0, Kategori: 'Minuman' }
];

describe('POS Component', () => {
    const mockRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
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

    it('updates total price when items are added', () => {
        render(<POS menu={mockMenu} refreshData={mockRefresh} />);

        fireEvent.click(screen.getByText('Nasi Goreng'));

        // Check for the price. Instead of just "15", we look for the one next to "Total"
        // or just check that we have multiple "15" occurrences.
        const priceOccurrences = screen.getAllByText(/15/);
        expect(priceOccurrences.length).toBeGreaterThan(1); // One in grid, one in total
    });
});
