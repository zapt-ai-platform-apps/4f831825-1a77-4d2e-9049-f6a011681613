import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, isValid } from 'date-fns';

export function daysInMonth(currentMonth) {
  if (!isValid(currentMonth)) {
    console.error('Invalid currentMonth:', currentMonth);
    return [];
  }
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  if (start > end) {
    console.error('startOfMonth is after endOfMonth:', start, end);
    return [];
  }
  return eachDayOfInterval({ start, end });
}

export function startDayOfWeek(currentMonth) {
  if (!isValid(currentMonth)) {
    console.warn('currentMonth is invalid. Defaulting start day to Sunday.');
    return 0; // Sunday
  }
  return getDay(startOfMonth(currentMonth));
}