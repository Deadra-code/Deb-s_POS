/**
 * Haptic Feedback Service
 * Provides tactile responses using the Web Vibration API.
 */

const haptics = {
    /**
     * Light impact for standard button presses
     */
    tap: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    /**
     * Medium impact for successful actions
     */
    success: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
        }
    },

    /**
     * Heavy/Double pulse for errors or destructive actions
     */
    error: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
    },

    /**
     * Very light tick for selection changes
     */
    tick: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }
    }
};

export default haptics;
