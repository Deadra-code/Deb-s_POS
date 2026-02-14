import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { fetchData } from '../services/api';

vi.mock('../services/api', () => ({
    fetchData: vi.fn()
}));

describe('LoginPage', () => {
    const mockOnLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const fillForm = (u = 'testuser', p = 'pass123') => {
        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: u } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: p } });
    };

    it('renders login form', () => {
        render(<LoginPage onLogin={mockOnLogin} />);
        expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Masuk Aplikasi/i)).toBeInTheDocument();
    });

    it('calls onLogin with token on successful login', async () => {
        fetchData.mockResolvedValue({ success: true, token: 'fake-token' });

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm();
        fireEvent.click(screen.getByText(/Masuk Aplikasi/i));

        await waitFor(() => {
            expect(fetchData).toHaveBeenCalledWith('login', 'POST', { username: 'testuser', password: 'pass123' });
            expect(mockOnLogin).toHaveBeenCalledWith('fake-token');
        });
    });

    it('shows error message on failed login', async () => {
        fetchData.mockResolvedValue({ success: false, error: 'Invalid creds' });

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm();
        fireEvent.click(screen.getByText(/Masuk Aplikasi/i));

        await waitFor(() => {
            expect(screen.getByText(/Invalid creds/i)).toBeInTheDocument();
        });
    });

    it('shows network error message', async () => {
        fetchData.mockRejectedValue(new Error('Network Err'));

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm();
        fireEvent.click(screen.getByText(/Masuk Aplikasi/i));

        await waitFor(() => {
            expect(screen.getByText(/Gagal menghubungi server/i)).toBeInTheDocument();
        });
    });
});
