import { format, parseISO, addDays, differenceInDays } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date, formatString = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get an array of dates between start and end (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = differenceInDays(end, start) + 1;

  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i);
    return toISODate(date);
  });
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(date: string): string {
  const dateObj = parseISO(date);
  return format(dateObj, 'EEEE');
}

/**
 * Check if a date is today
 */
export function isToday(date: string): boolean {
  const dateObj = parseISO(date);
  const today = new Date();
  return toISODate(dateObj) === toISODate(today);
}
