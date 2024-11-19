import { getHours, getMinutes } from 'date-fns';

export function getTimeIntervalString(date: Date, interval = 5): string {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  const intervalMinutes = Math.floor(minutes / interval) * interval;
  return `${hours.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
}
