import { describe, it, expect } from 'vitest';
import { initDB, getAll, add, update, deleteRecord, getById } from './database';

describe('database service', () => {
    describe('exports', () => {
        it('should export initDB function', () => {
            expect(typeof initDB).toBe('function');
        });

        it('should export getAll function', () => {
            expect(typeof getAll).toBe('function');
        });

        it('should export add function', () => {
            expect(typeof add).toBe('function');
        });

        it('should export update function', () => {
            expect(typeof update).toBe('function');
        });

        it('should export deleteRecord function', () => {
            expect(typeof deleteRecord).toBe('function');
        });

        it('should export getById function', () => {
            expect(typeof getById).toBe('function');
        });
    });

    describe('initDB', () => {
        it('should return a promise', () => {
            const result = initDB();
            expect(result).toBeInstanceOf(Promise);
        });
    });
});
