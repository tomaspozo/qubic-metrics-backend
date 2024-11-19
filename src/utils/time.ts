import { getHours, getMinutes } from 'date-fns';

export function getTimeIntervalString(date: Date, interval = 5): string {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  const intervalMinutes = Math.floor(minutes / interval) * interval;

  // Handle edge case when minutes roll over to next hour
  if (intervalMinutes >= 60) {
    return `${(hours + 1).toString().padStart(2, '0')}:00`;
  }

  return `${hours.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
}
