
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getWeekEnd = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
};

/**
 * Converts a UTC date string to the user's local timezone
 * @param dateString The UTC date string to convert
 * @returns Date object in local timezone or null if invalid
 */
export const toLocalTime = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  
  try {
    // Parse the date string (assumed to be in UTC/ISO format)
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date; // Date constructor automatically converts to local timezone
  } catch (error) {
    console.error("Error converting date to local time:", error);
    return null;
  }
};

/**
 * Formats a date string to the user's local timezone with the specified format
 * @param dateString The UTC date string to format
 * @param formatStr Optional format string for date-fns format function
 * @param fallback Fallback string to return if date is invalid
 * @returns Formatted date string in local timezone
 */
export const formatLocalTime = (
  dateString: string | undefined | null,
  formatStr: string = "MMM d, yyyy h:mm a",
  fallback: string = "N/A"
): string => {
  const localDate = toLocalTime(dateString);
  if (!localDate) return fallback;
  
  try {
    return format(localDate, formatStr);
  } catch (error) {
    console.error("Error formatting local time:", error);
    return fallback;
  }
};

// Import format from date-fns
import { format } from "date-fns";
