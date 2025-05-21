// auth-utils.js
// Helper utility functions to handle authentication-related operations

/**
 * Stores a value in sessionStorage with an expiration time
 * @param {string} key - The key to store the data under
 * @param {any} value - The value to store
 * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
 */
export const storeWithExpiry = (key, value, ttl = 24 * 60 * 60 * 1000) => {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
};

/**
 * Retrieves a value from sessionStorage and checks if it's expired
 * @param {string} key - The key to retrieve
 * @returns {any|null} - The stored value or null if expired/not found
 */
export const getWithExpiry = (key) => {
    const itemStr = sessionStorage.getItem(key);

    // Return null if no item found
    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // Compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, remove it from storage
        sessionStorage.removeItem(key);
        return null;
    }

    return item.value;
};

/**
 * Checks if user is authenticated with valid session
 * @returns {boolean} - Whether user is authenticated
 */
export const isAuthenticated = () => {
    return getWithExpiry('userID') !== null;
};

/**
 * Gets the current user ID if authenticated
 * @returns {number|null} - User ID if authenticated, null otherwise
 */
export const getCurrentUserId = () => {
    return getWithExpiry('userID');
};

/**
 * Gets the current user type if authenticated
 * @returns {string|null} - User type if authenticated, null otherwise
 */
export const getCurrentUserType = () => {
    return getWithExpiry('userType');
};

/**
 * Gets the current user name if authenticated
 * @returns {string|null} - User name if authenticated, null otherwise
 */
export const getCurrentUserName = () => {
    return getWithExpiry('userName');
};

/**
 * Logs out the user by clearing all authentication data
 */
export const logout = () => {
    sessionStorage.removeItem('userID');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('loginTimestamp');
};

/**
 * Checks if user session is about to expire
 * @param {number} warningThreshold - Time in milliseconds before expiry to start warning (default: 5 minutes)
 * @returns {boolean} - Whether session is about to expire
 */
export const isSessionNearExpiry = (warningThreshold = 5 * 60 * 1000) => {
    const itemStr = sessionStorage.getItem('userId');

    if (!itemStr) return false;

    const item = JSON.parse(itemStr);
    const now = new Date();
    const timeLeft = item.expiry - now.getTime();

    return timeLeft > 0 && timeLeft <= warningThreshold;
};