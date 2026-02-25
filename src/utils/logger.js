/**
 * Production Console Logger
 * Suppresses console logs in production while keeping errors visible
 * 
 * Usage:
 *   import { log, warn, error } from '@/utils/logger';
 *   
 *   log('This won\'t show in production');
 *   error('This will always show');
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log message (development only)
 */
export function log(...args) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Warn message (always visible)
 */
export function warn(...args) {
  console.warn(...args);
}

/**
 * Error message (always visible)
 */
export function error(...args) {
  console.error(...args);
}

/**
 * Debug message (development only, with prefix)
 */
export function debug(module, ...args) {
  if (isDevelopment) {
    console.debug(`[${module}]`, ...args);
  }
}

/**
 * Info message (development only)
 */
export function info(...args) {
  if (isDevelopment) {
    console.info(...args);
  }
}

export default {
  log,
  warn,
  error,
  debug,
  info,
};
