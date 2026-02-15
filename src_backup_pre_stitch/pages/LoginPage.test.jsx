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

    const fillForm = (p = '123456') => {
        fireEvent.change(screen.getByPlaceholderText(/••••••/i), { target: { value: p } });
    };

    it('renders login form', () => {
        render(<LoginPage onLogin={mockOnLogin} />);
        expect(screen.getByPlaceholderText(/••••••/i)).toBeInTheDocument();
        expect(screen.getByText(/Masuk Sekarang/i)).toBeInTheDocument();
    });

    it('calls onLogin with token on successful login', async () => {
        fetchData.mockResolvedValue({ success: true, token: 'fake-token' });

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm('123456');
        fireEvent.click(screen.getByText(/Masuk Sekarang/i));

        await waitFor(() => {
            expect(fetchData).toHaveBeenCalledWith('login', 'POST', { passcode: '123456' });
            expect(mockOnLogin).toHaveBeenCalledWith('fake-token');
        });
    });

    it('shows error message on failed login', async () => {
        fetchData.mockResolvedValue({ success: false, error: 'Passcode salah' });

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm('wrong');
        fireEvent.click(screen.getByText(/Masuk Sekarang/i));

        await waitFor(() => {
            expect(screen.getByText(/Passcode salah/i)).toBeInTheDocument();
        });
    });

    it('shows network error message', async () => {
        fetchData.mockRejectedValue(new Error('Network Err'));

        render(<LoginPage onLogin={mockOnLogin} />);
        fillForm('123456');
        fireEvent.click(screen.getByText(/Masuk Sekarang/i));

        await waitFor(() => {
            expect(screen.getByText(/Gagal menghubungi server/i)).toBeInTheDocument();
        });
    });
});
