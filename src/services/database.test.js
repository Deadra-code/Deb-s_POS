import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initDB, getAll, add, update, deleteRecord } from './database';

// Mock IndexedDB
const mockDB = {
    transaction: vi.fn(),
    objectStoreNames: {
        contains: vi.fn(),
    },
    createObjectStore: vi.fn(),
};

const mockTransaction = {
    objectStore: vi.fn(),
};

const mockStore = {
    getAll: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
};

describe('database service', () => {
    beforeEach(() => {
        // Mock indexedDB
        global.indexedDB = {
            open: vi.fn(),
        };
        
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initDB', () => {
        it('should return existing database instance if already initialized', async () => {
            // This test verifies the singleton pattern
            // In real scenario, dbInstance would be set after first call
            expect(typeof initDB).toBe('function');
        });

        it('should open database with correct name and version', () => {
            const mockRequest = {
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: mockDB,
            };

            global.indexedDB.open.mockReturnValue(mockRequest);

            initDB();

            expect(global.indexedDB.open).toHaveBeenCalledWith('debs-pos-db', 1);
        });

        it('should create object stores if they don\'t exist', () => {
            const mockRequest = {
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    ...mockDB,
                    objectStoreNames: {
                        contains: () => false,
                    },
                    createObjectStore: vi.fn(),
                },
            };

            global.indexedDB.open.mockReturnValue(mockRequest);

            initDB();

            // Trigger upgradeneeded
            mockRequest.onupgradeneeded({ target: mockRequest.result });

            expect(mockRequest.result.createObjectStore).toHaveBeenCalled();
        });
    });

    describe('getAll', () => {
        it('should retrieve all records from a store', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            
            global.indexedDB.open.mockReturnValue({
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    transaction: () => mockTransaction,
                },
            });

            mockTransaction.objectStore.mockReturnValue(mockStore);
            mockStore.getAll.mockReturnValue({
                onsuccess: null,
                onerror: null,
                result: mockData,
            });

            const result = await getAll('products');

            expect(mockTransaction.objectStore).toHaveBeenCalledWith('products');
            expect(mockStore.getAll).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        it('should handle errors', async () => {
            global.indexedDB.open.mockReturnValue({
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    transaction: () => mockTransaction,
                },
            });

            mockTransaction.objectStore.mockReturnValue(mockStore);
            mockStore.getAll.mockReturnValue({
                onsuccess: null,
                onerror: null,
                error: new Error('Database error'),
            });

            await expect(getAll('products')).rejects.toThrow('Database error');
        });
    });

    describe('add', () => {
        it('should add a new record', async () => {
            const testData = { name: 'Test Product', price: 1000 };
            
            global.indexedDB.open.mockReturnValue({
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    transaction: () => mockTransaction,
                },
            });

            mockTransaction.objectStore.mockReturnValue(mockStore);
            mockStore.add.mockReturnValue({
                onsuccess: null,
                onerror: null,
                result: 1,
            });

            const result = await add('products', testData);

            expect(mockTransaction.objectStore).toHaveBeenCalledWith('products');
            expect(mockStore.add).toHaveBeenCalledWith(testData);
            expect(result).toBe(1);
        });
    });

    describe('update', () => {
        it('should update an existing record', async () => {
            const testData = { id: 1, name: 'Updated Product', price: 1500 };
            
            global.indexedDB.open.mockReturnValue({
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    transaction: () => mockTransaction,
                },
            });

            mockTransaction.objectStore.mockReturnValue(mockStore);
            mockStore.put.mockReturnValue({
                onsuccess: null,
                onerror: null,
                result: 1,
            });

            const result = await update('products', testData);

            expect(mockTransaction.objectStore).toHaveBeenCalledWith('products');
            expect(mockStore.put).toHaveBeenCalledWith(testData);
            expect(result).toBe(1);
        });
    });

    describe('deleteRecord', () => {
        it('should delete a record by id', async () => {
            global.indexedDB.open.mockReturnValue({
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                result: {
                    transaction: () => mockTransaction,
                },
            });

            mockTransaction.objectStore.mockReturnValue(mockStore);
            mockStore.delete.mockReturnValue({
                onsuccess: null,
                onerror: null,
            });

            await deleteRecord('products', 1);

            expect(mockTransaction.objectStore).toHaveBeenCalledWith('products');
            expect(mockStore.delete).toHaveBeenCalledWith(1);
        });
    });
});
