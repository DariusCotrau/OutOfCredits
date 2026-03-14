export interface DateRange {
  start: Date;
  end: Date;
}
export interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}
export interface DurationComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export const now = (): number => Date.now();
export const today = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
export const tomorrow = (): Date => {
  const date = today();
  date.setDate(date.getDate() + 1);
  return date;
};
export const yesterday = (): Date => {
  const date = today();
  date.setDate(date.getDate() - 1);
  return date;
};
export const startOfWeek = (date: Date | number = new Date()): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};
export const endOfWeek = (date: Date | number = new Date()): Date => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};
export const startOfDay = (date: Date | number = new Date()): number => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result.getTime();
};
export const endOfDay = (date: Date | number = new Date()): number => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result.getTime();
};
export const startOfMonth = (date: Date | number = new Date()): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};
export const endOfMonth = (date: Date | number = new Date()): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};
export const getDaysBetween = (
  startDate: Date | number,
  endDate: Date | number
): Date[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }
  return days;
};
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};
export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
export const isSameWeek = (date1: Date, date2: Date): boolean => {
  const start1 = startOfWeek(date1);
  const start2 = startOfWeek(date2);
  return isSameDay(start1, start2);
};
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};
export const isYesterday = (date: Date): boolean => {
  return isSameDay(date, yesterday());
};
export const isPast = (date: Date): boolean => {
  return date.getTime() < now();
};
export const isFuture = (date: Date): boolean => {
  return date.getTime() > now();
};
export const isWithinRange = (date: Date, range: DateRange): boolean => {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
};
export const msToComponents = (ms: number): DurationComponents => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
};
export const componentsToMs = (components: Partial<DurationComponents>): number => {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = components;
  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000 + seconds * 1000;
};
export const diffInMs = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime());
};
export const diffInMinutes = (date1: Date, date2: Date): number => {
  return Math.floor(diffInMs(date1, date2) / (60 * 1000));
};
export const diffInHours = (date1: Date, date2: Date): number => {
  return Math.floor(diffInMs(date1, date2) / (60 * 60 * 1000));
};
export const diffInDays = (date1: Date, date2: Date): number => {
  return Math.floor(diffInMs(date1, date2) / (24 * 60 * 60 * 1000));
};
export const getCurrentWeekRange = (): DateRange => ({
  start: startOfWeek(),
  end: endOfWeek(),
});
export const getCurrentMonthRange = (): DateRange => ({
  start: startOfMonth(),
  end: endOfMonth(),
});
export const getLastNDaysRange = (n: number): DateRange => ({
  start: addDays(today(), -(n - 1)),
  end: new Date(),
});
export const getDatesInRange = (range: DateRange): Date[] => {
  const dates: Date[] = [];
  const current = new Date(range.start);
  while (current <= range.end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};
export const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
export const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const getDayName = (date: Date): string => dayNames[date.getDay()];
export const getShortDayName = (date: Date): string => shortDayNames[date.getDay()];
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
export const shortMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
export const getMonthName = (date: Date): string => monthNames[date.getMonth()];
export const getShortMonthName = (date: Date): string => shortMonthNames[date.getMonth()];
