import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const ProblemChild = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
    it('renders error UI when child throws', () => {
        // Suppress console.error for this test as we expect an error
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Waduh, ada masalah!/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Segarkan Halaman/i })).toBeInTheDocument();

        spy.mockRestore();
    });

    it('renders children when NO error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );

        expect(screen.getByText('Safe Content')).toBeInTheDocument();
    });

    it('reloads page when refresh button is clicked', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const reloadSpy = vi.fn();

        // Proper way to mock location in jsdom
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, reload: reloadSpy };

        render(
            <ErrorBoundary>
                <ProblemChild />
            </ErrorBoundary>
        );

        fireEvent.click(screen.getByRole('button', { name: /Segarkan Halaman/i }));
        expect(reloadSpy).toHaveBeenCalled();

        spy.mockRestore();
        window.location = originalLocation;
    });
});
