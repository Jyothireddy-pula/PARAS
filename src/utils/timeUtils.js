/**
 * Utility functions for timezone handling
 * Converts all times to IST (Indian Standard Time)
 */

/**
 * Convert a date to IST timezone
 * @param {Date|string} date - The date to convert
 * @returns {Date} - Date in IST timezone
 */
export const toIST = (date) => {
  const dateObj = new Date(date);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60; // 5 hours 30 minutes in minutes
  const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
  return new Date(utc + (istOffset * 60000));
};

/**
 * Format date to IST locale string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string in IST
 */
export const formatIST = (date, options = {}) => {
  const dateObj = new Date(date);
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    ...options
  };
  return dateObj.toLocaleString('en-IN', defaultOptions);
};

/**
 * Format time to IST locale string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string in IST
 */
export const formatISTTime = (date, options = {}) => {
  const dateObj = new Date(date);
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    ...options
  };
  return dateObj.toLocaleTimeString('en-IN', defaultOptions);
};

/**
 * Format date to IST locale string (date only)
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string in IST
 */
export const formatISTDate = (date, options = {}) => {
  const dateObj = new Date(date);
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  return dateObj.toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Get current time in IST
 * @returns {Date} - Current time in IST
 */
export const getCurrentIST = () => {
  return toIST(new Date());
};

/**
 * Calculate duration between two dates in minutes
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (defaults to current time)
 * @returns {number} - Duration in minutes
 */
export const calculateDurationMinutes = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60));
};

/**
 * Format duration in a human-readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};
