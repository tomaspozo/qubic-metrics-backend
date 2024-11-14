import { getHours, getMinutes } from 'date-fns';

export function getTimeIntervalString(date: Date): string {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  const intervalMinutes = Math.floor(minutes / 5) * 5;
  return `${hours.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
}
