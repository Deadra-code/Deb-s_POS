/**
 * Session Timeout Manager
 * Automatically logs out users after period of inactivity
 * For security in shared/public devices
 */

const DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_BEFORE = 5 * 60 * 1000; // Warn 5 minutes before timeout

const EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

class SessionTimeout {
    constructor(options = {}) {
        this.timeout = options.timeout || DEFAULT_TIMEOUT;
        this.warningBefore = options.warningBefore || WARNING_BEFORE;
        this.onTimeout = options.onTimeout;
        this.onWarning = options.onWarning;
        this.onCleanup = options.onCleanup;
        
        this.lastActivity = Date.now();
        this.warningShown = false;
        this.timerId = null;
        this.boundHandler = this.handleActivity.bind(this);
    }

    /**
     * Start monitoring user activity
     */
    start() {
        // Add event listeners
        EVENTS.forEach(event => {
            document.addEventListener(event, this.boundHandler, { passive: true, capture: true });
        });

        // Start the timeout checker
        this.checkTimeout();
        
        console.log('[SessionTimeout] Monitoring started');
    }

    /**
     * Stop monitoring user activity
     */
    stop() {
        // Remove event listeners
        EVENTS.forEach(event => {
            document.removeEventListener(event, this.boundHandler, { capture: true });
        });

        // Clear timer
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        console.log('[SessionTimeout] Monitoring stopped');
    }

    /**
     * Handle user activity event
     */
    handleActivity() {
        this.lastActivity = Date.now();
        this.warningShown = false;
    }

    /**
     * Check if user should be timed out or warned
     */
    checkTimeout() {
        const now = Date.now();
        const idleTime = now - this.lastActivity;
        const timeUntilTimeout = this.timeout - idleTime;

        if (idleTime >= this.timeout) {
            // Timeout reached
            this.handleTimeout();
        } else if (!this.warningShown && timeUntilTimeout <= this.warningBefore) {
            // Show warning
            this.handleWarning(timeUntilTimeout);
        }

        // Continue checking
        this.timerId = setTimeout(() => this.checkTimeout(), 1000);
    }

    /**
     * Handle timeout - log out user
     */
    handleTimeout() {
        console.log('[SessionTimeout] Timeout reached');
        
        if (this.onCleanup) {
            this.onCleanup();
        }

        if (this.onTimeout) {
            this.onTimeout();
        }

        this.stop();
    }

    /**
     * Handle warning - notify user before timeout
     */
    handleWarning(timeRemaining) {
        this.warningShown = true;
        console.log(`[SessionTimeout] Warning: ${Math.round(timeRemaining / 1000)}s remaining`);

        if (this.onWarning) {
            this.onWarning(Math.round(timeRemaining / 1000));
        }
    }

    /**
     * Reset the timeout timer (call on user activity)
     */
    reset() {
        this.lastActivity = Date.now();
        this.warningShown = false;
    }
}

/**
 * Create and configure session timeout with default behavior
 * @param {Object} options - Configuration options
 * @returns {SessionTimeout} Session timeout instance
 */
export function createSessionTimeout(options = {}) {
    const session = new SessionTimeout({
        timeout: options.timeout || DEFAULT_TIMEOUT,
        warningBefore: options.warningBefore || WARNING_BEFORE,
        onTimeout: options.onTimeout || (() => {
            // Default: clear session and reload
            localStorage.removeItem('POS_TOKEN');
            localStorage.removeItem('POS_ROLE');
            localStorage.removeItem('POS_VIEW');
            window.location.reload();
        }),
        onWarning: options.onWarning,
        onCleanup: options.onCleanup,
    });

    return session;
}

export default SessionTimeout;
