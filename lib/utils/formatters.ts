/**
 * Format utilities for displaying data in the UI
 */

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a number with specified decimal places
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format quantity and unit together
 */
export function formatQuantity(quantity: number, unit: string): string {
  const formattedQty = quantity % 1 === 0 ? quantity.toString() : formatNumber(quantity);
  return `${formattedQty} ${unit}`;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format meal time for display
 */
export function formatMealTime(mealTime: string): string {
  return capitalize(mealTime);
}
