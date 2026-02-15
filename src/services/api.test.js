import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchData } from './api';

describe('api service', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should construct the correct URL for GET requests', async () => {
        const mockResponse = { success: true };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await fetchData('getMenu');

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('action=getMenu'));
    });

    it('should send a POST request with stringified body', async () => {
        const mockResponse = { success: true };
        const testBody = { foo: 'bar' };
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await fetchData('saveOrder', 'POST', testBody);

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(testBody)
            })
        );
    });

    it('should handle fetch errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        fetch.mockRejectedValueOnce(new Error('Network failure'));

        await expect(fetchData('getMenu')).rejects.toThrow('Network failure');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
