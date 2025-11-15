/**
 * Time utilities for displaying UTC, local, and multiple timezones
 */

import { format, formatInTimeZone } from 'date-fns-tz';

export interface TimeZoneInfo {
  name: string;
  abbreviation: string;
  offset: string;
  time: string;
}

/**
 * Get current UTC time formatted
 */
export function getUTCTime(date: Date = new Date()): string {
  return format(date, 'HH:mm:ss', { timeZone: 'UTC' });
}

/**
 * Get current UTC date formatted
 */
export function getUTCDate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd', { timeZone: 'UTC' });
}

/**
 * Get local time formatted
 */
export function getLocalTime(date: Date = new Date()): string {
  return format(date, 'HH:mm:ss');
}

/**
 * Get time for a specific timezone
 */
export function getTimeInZone(
  timezone: string,
  date: Date = new Date(),
  formatStr: string = 'HH:mm:ss'
): string {
  try {
    return formatInTimeZone(date, timezone, formatStr);
  } catch (error) {
    console.error(`Invalid timezone: ${timezone}`, error);
    return 'Invalid TZ';
  }
}

/**
 * Common timezones for display
 */
export const COMMON_TIMEZONES = [
  { name: 'UTC', tz: 'UTC', label: 'Universal Time' },
  { name: 'New York', tz: 'America/New_York', label: 'Eastern Time' },
  { name: 'London', tz: 'Europe/London', label: 'British Time' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', label: 'Japan Time' },
  { name: 'Sydney', tz: 'Australia/Sydney', label: 'Australian Eastern' },
  { name: 'Moscow', tz: 'Europe/Moscow', label: 'Moscow Time' },
] as const;

/**
 * Get local timezone name
 */
export function getLocalTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Calculate solar time for a location (for ham radio operators)
 */
export function getSolarTime(lng: number, date: Date = new Date()): string {
  // Solar noon occurs when the sun is at local meridian
  // Approximate by adjusting UTC time by longitude
  const solarOffset = lng * 4; // 4 minutes per degree
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const solarMinutes = (utcMinutes + solarOffset + 1440) % 1440;
  
  const hours = Math.floor(solarMinutes / 60);
  const minutes = Math.floor(solarMinutes % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
