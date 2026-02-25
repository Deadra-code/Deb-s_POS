import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NetworkStatus from './NetworkStatus';

describe('NetworkStatus', () => {
    it('is hidden when online', () => {
        vi.stubGlobal('navigator', { onLine: true });
        render(<NetworkStatus />);
        expect(screen.queryByText(/Koneksi Terputus/i)).not.toBeInTheDocument();
    });

    it('shows alert when offline', async () => {
        vi.stubGlobal('navigator', { onLine: false });
        render(<NetworkStatus />);
        expect(screen.getByText(/Koneksi Terputus/i)).toBeInTheDocument();
    });

    it('updates when line status changes', () => {
        vi.stubGlobal('navigator', { onLine: true });
        render(<NetworkStatus />);

        act(() => {
            window.dispatchEvent(new Event('offline'));
        });

        expect(screen.getByText(/Koneksi Terputus/i)).toBeInTheDocument();

        act(() => {
            window.dispatchEvent(new Event('online'));
        });

        expect(screen.queryByText(/Koneksi Terputus/i)).not.toBeInTheDocument();
    });

    it('handles errors gracefully', () => {
        // Test that component doesn't crash on error
        vi.stubGlobal('navigator', { onLine: false });
        expect(() => render(<NetworkStatus />)).not.toThrow();
    });
});
