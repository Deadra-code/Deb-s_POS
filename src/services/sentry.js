/**
 * Sentry Error Monitoring Configuration
 * 
 * To enable Sentry monitoring:
 * 1. Create a free account at https://sentry.io
 * 2. Create a new React project
 * 3. Copy the DSN from project settings
 * 4. Add VITE_SENTRY_DSN to your .env file
 * 
 * Note: Sentry is optional - app works without it
 */

import * as Sentry from '@sentry/react';

// Initialize Sentry only if DSN is provided
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('Sentry DSN not configured - error monitoring disabled');
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // Sample 10% of transactions
      
      // Error sampling - capture 100% of errors
      sampleRate: 1.0,
      
      // Release tracking
      release: `debs-pos@${import.meta.env.PACKAGE_VERSION || '4.0.0'}`,
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true, // Privacy: mask sensitive text
          blockAllMedia: true, // Privacy: block media
        }),
      ],

      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Capture 100% of error sessions

      // Before sending event, filter sensitive data
      beforeSend(event) {
        // Don't send events in development
        if (import.meta.env.DEV) {
          console.log('[Sentry] Event captured (not sent in dev):', event);
          return null;
        }
        
        // Filter out sensitive information
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        
        return event;
      },

      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        
        // Network errors
        'NetworkError',
        'Network request failed',
        
        // Random plugins/extensions
        'atomicFindClose',
        'fb_xd_fragment',
        
        // Other plugins
        'CanvasRenderingContext2D',
      ],

      // Deny URLs (third-party scripts)
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });

    console.log('Sentry initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
    return false;
  }
};

// Error boundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Capture custom errors
export const captureError = (error, context) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture messages (info, warning, error)
export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

// Set user context (for debugging)
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.username,
      username: user.username,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Performance monitoring helpers
export const startTransaction = (name) => {
  return Sentry.startSpan({ name, op: 'ui.action' }, () => {});
};

export const measureFunction = async (name, fn) => {
  return Sentry.startSpan({ name, op: 'function' }, async () => {
    return await fn();
  });
};

export default Sentry;
