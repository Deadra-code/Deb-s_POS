/**
 * Security utilities for passcode hashing
 * Uses bcryptjs for secure password hashing
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a passcode using bcrypt
 * @param {string} passcode - The plain text passcode
 * @returns {Promise<string>} - The hashed passcode
 */
export const hashPasscode = async (passcode) => {
    return await bcrypt.hash(passcode, SALT_ROUNDS);
};

/**
 * Compare a passcode with a hash
 * @param {string} passcode - The plain text passcode
 * @param {string} hash - The hashed passcode
 * @returns {Promise<boolean>} - True if passcode matches
 */
export const verifyPasscode = async (passcode, hash) => {
    return await bcrypt.compare(passcode, hash);
};

/**
 * Check if a string is already hashed
 * @param {string} str - The string to check
 * @returns {boolean} - True if already hashed
 */
export const isHashed = (str) => {
    return str && str.startsWith('$2a$') || str.startsWith('$2b$');
};
