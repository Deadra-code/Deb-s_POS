import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SessionTimeout from './session-timeout';

describe('SessionTimeout', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(document, 'addEventListener');
        vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should start monitoring when start() is called', () => {
        const session = new SessionTimeout({
            timeout: 30000,
            onTimeout: vi.fn(),
        });

        session.start();

        expect(document.addEventListener).toHaveBeenCalledTimes(5);
        expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), expect.any(Object));
        expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), expect.any(Object));
    });

    it('should stop monitoring when stop() is called', () => {
        const session = new SessionTimeout({
            timeout: 30000,
            onTimeout: vi.fn(),
        });

        session.start();
        session.stop();

        expect(document.removeEventListener).toHaveBeenCalledTimes(5);
    });

    it('should reset lastActivity on user activity', () => {
        const session = new SessionTimeout({
            timeout: 30000,
            onTimeout: vi.fn(),
        });

        const initialActivity = session.lastActivity;
        vi.advanceTimersByTime(1000);

        session.handleActivity();

        expect(session.lastActivity).toBeGreaterThan(initialActivity);
    });

    it('should call onTimeout when timeout is reached', () => {
        const onTimeoutMock = vi.fn();
        const session = new SessionTimeout({
            timeout: 5000,
            onTimeout: onTimeoutMock,
        });

        session.start();
        vi.advanceTimersByTime(6000);

        expect(onTimeoutMock).toHaveBeenCalled();
    });

    it('should call onWarning before timeout', () => {
        const onWarningMock = vi.fn();
        const session = new SessionTimeout({
            timeout: 10000,
            warningBefore: 5000,
            onWarning: onWarningMock,
        });

        session.start();
        
        // Move time forward to trigger warning (after 5 seconds of inactivity)
        vi.advanceTimersByTime(6000);

        expect(onWarningMock).toHaveBeenCalled();
    });

    it('should not timeout if user is active', () => {
        const onTimeoutMock = vi.fn();
        const session = new SessionTimeout({
            timeout: 10000,
            onTimeout: onTimeoutMock,
        });

        session.start();

        // Simulate user activity at 5 seconds
        vi.advanceTimersByTime(5000);
        session.handleActivity();

        // Continue to 15 seconds (should not timeout because of activity at 5s)
        vi.advanceTimersByTime(10000);

        expect(onTimeoutMock).not.toHaveBeenCalled();
    });

    it('should reset warning flag on user activity', () => {
        const session = new SessionTimeout({
            timeout: 10000,
            warningBefore: 5000,
            onWarning: vi.fn(),
        });

        session.start();
        session.warningShown = true;

        session.handleActivity();

        expect(session.warningShown).toBe(false);
    });

    it('should use default timeout if not provided', () => {
        const session = new SessionTimeout();
        expect(session.timeout).toBe(30 * 60 * 1000); // 30 minutes
    });

    it('should call onCleanup before timeout', () => {
        const onCleanupMock = vi.fn();
        const session = new SessionTimeout({
            timeout: 5000,
            onCleanup: onCleanupMock,
            onTimeout: vi.fn(),
        });

        session.start();
        vi.advanceTimersByTime(6000);

        expect(onCleanupMock).toHaveBeenCalled();
    });
});
