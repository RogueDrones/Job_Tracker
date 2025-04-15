// # frontend/src/utils/dateUtils.js
/**
 * Format a date string to New Zealand format (dd/mm/yyyy)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatNZDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };