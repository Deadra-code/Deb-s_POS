import { describe, it, expect } from 'vitest';
import { hashPasscode, verifyPasscode, isHashed } from './security';

describe('security utilities', () => {
    describe('isHashed', () => {
        it('should return true for bcrypt hash starting with $2a$', () => {
            expect(isHashed('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'))
                .toBe(true);
        });

        it('should return true for bcrypt hash starting with $2b$', () => {
            expect(isHashed('$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'))
                .toBe(true);
        });

        it('should return false for plain text password', () => {
            expect(isHashed('admin123')).toBe(false);
        });

        it('should return falsy for empty string', () => {
            expect(isHashed('')).toBeFalsy();
        });

        it('should return falsy for null', () => {
            expect(isHashed(null)).toBeFalsy();
        });

        it('should return falsy for undefined', () => {
            expect(isHashed(undefined)).toBeFalsy();
        });
    });

    describe('hashPasscode', () => {
        it('should hash a passcode', async () => {
            const passcode = 'test123';
            const hash = await hashPasscode(passcode);
            
            expect(hash).toBeDefined();
            expect(hash).not.toBe(passcode);
            expect(hash.startsWith('$2')).toBe(true);
        });

        it('should generate different hashes for same passcode', async () => {
            const passcode = 'test123';
            const hash1 = await hashPasscode(passcode);
            const hash2 = await hashPasscode(passcode);
            
            expect(hash1).not.toBe(hash2);
        });

        it('should handle empty string', async () => {
            const hash = await hashPasscode('');
            expect(hash).toBeDefined();
            expect(hash.startsWith('$2')).toBe(true);
        });
    });

    describe('verifyPasscode', () => {
        it('should verify correct passcode', async () => {
            const passcode = 'test123';
            const hash = await hashPasscode(passcode);
            
            const isValid = await verifyPasscode(passcode, hash);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect passcode', async () => {
            const passcode = 'test123';
            const hash = await hashPasscode(passcode);
            
            const isValid = await verifyPasscode('wrong123', hash);
            expect(isValid).toBe(false);
        });

        it('should handle empty passcode', async () => {
            const hash = await hashPasscode('');
            
            const isValid = await verifyPasscode('', hash);
            expect(isValid).toBe(true);
        });

        it('should reject when hash is invalid', async () => {
            const isValid = await verifyPasscode('test', 'invalid-hash');
            expect(isValid).toBe(false);
        });
    });
});
