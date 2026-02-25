import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData } from './api';

describe('api service', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = vi.fn();
        // Mock localStorage
        Storage.prototype.getItem = vi.fn();
        Storage.prototype.setItem = vi.fn();
        Storage.prototype.removeItem = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('should construct the correct URL for GET requests', async () => {
        const mockResponse = { success: true };
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await fetchData('getMenu');

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('action=getMenu'));
    });

    it('should send a POST request with stringified body', async () => {
        const mockResponse = { success: true };
        const testBody = { foo: 'bar' };
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await fetchData('saveOrder', 'POST', testBody);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(testBody)
            })
        );
    });

    it('should handle fetch errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        global.fetch.mockRejectedValueOnce(new Error('Network failure'));

        await expect(fetchData('getMenu')).rejects.toThrow('Network failure');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
