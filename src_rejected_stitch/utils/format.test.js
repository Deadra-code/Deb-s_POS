import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
    it('formats numbers correctly as IDR', () => {
        expect(formatCurrency(10000)).toContain('Rp');
        expect(formatCurrency(10000)).toContain('10.000');
    });

    it('handles string inputs', () => {
        expect(formatCurrency('15000')).toContain('15.000');
    });

    it('returns Rp 0 for invalid inputs', () => {
        expect(formatCurrency('abc')).toBe('Rp 0');
    });
});

describe('formatDate', () => {
    it('formats dates correctly', () => {
        const date = '2026-02-15';
        expect(formatDate(date)).toContain('Februari');
        expect(formatDate(date)).toContain('2026');
    });

    it('returns - for invalid dates', () => {
        expect(formatDate('invalid')).toBe('-');
    });
});
