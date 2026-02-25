import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    dispatchDbError,
    subscribeToDbErrors,
    getErrorMessage,
} from './db-error-handler';

describe('db-error-handler', () => {
    describe('getErrorMessage', () => {
        it('should return user-friendly message for fetch products', () => {
            expect(getErrorMessage('fetch products'))
                .toBe('Gagal memuat daftar produk');
        });

        it('should return user-friendly message for save order', () => {
            expect(getErrorMessage('save order'))
                .toBe('Gagal menyimpan pesanan');
        });

        it('should return user-friendly message for delete user', () => {
            expect(getErrorMessage('delete user'))
                .toBe('Gagal menghapus pengguna');
        });

        it('should return generic message for unknown operation', () => {
            expect(getErrorMessage('unknown operation'))
                .toBe('Terjadi kesalahan database');
        });

        it('should handle empty string operation', () => {
            expect(getErrorMessage(''))
                .toBe('Terjadi kesalahan database');
        });
    });

    describe('dispatchDbError', () => {
        let dispatchEventSpy;

        beforeEach(() => {
            dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
        });

        afterEach(() => {
            dispatchEventSpy.mockRestore();
        });

        it('should dispatch custom event with error details', () => {
            const operation = 'test operation';
            const error = new Error('Test error');

            dispatchDbError(operation, error);

            expect(dispatchEventSpy).toHaveBeenCalledWith(
                expect.any(CustomEvent)
            );

            const event = dispatchEventSpy.mock.calls[0][0];
            expect(event.type).toBe('db-error');
            expect(event.detail.operation).toBe(operation);
            expect(event.detail.error).toBe('Test error');
        });
    });

    describe('subscribeToDbErrors', () => {
        it('should call handler when error is dispatched', () => {
            const handler = vi.fn();
            const unsubscribe = subscribeToDbErrors(handler);

            dispatchDbError('test op', new Error('test error'));

            expect(handler).toHaveBeenCalledWith('test op', 'test error');

            unsubscribe();
        });

        it('should stop receiving events after unsubscribe', () => {
            const handler = vi.fn();
            const unsubscribe = subscribeToDbErrors(handler);

            unsubscribe();

            dispatchDbError('test op', new Error('test error'));

            expect(handler).not.toHaveBeenCalled();
        });

        it('should handle multiple subscribers', () => {
            const handler1 = vi.fn();
            const handler2 = vi.fn();

            const unsubscribe1 = subscribeToDbErrors(handler1);
            const unsubscribe2 = subscribeToDbErrors(handler2);

            dispatchDbError('test op', new Error('test error'));

            expect(handler1).toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();

            unsubscribe1();
            unsubscribe2();
        });
    });
});
