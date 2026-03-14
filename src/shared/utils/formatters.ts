import { msToComponents, isToday, isYesterday, DurationComponents } from './date';
export const formatDuration = (
  ms: number,
  options: {
    showSeconds?: boolean;
    shortLabels?: boolean;
    maxUnits?: number;
  } = {}
): string => {
  const { showSeconds = false, shortLabels = true, maxUnits = 2 } = options;
  const { days, hours, minutes, seconds } = msToComponents(ms);
  const parts: string[] = [];
  const labels = shortLabels
    ? { d: 'd', h: 'h', m: 'm', s: 's' }
    : { d: ' days', h: ' hours', m: ' minutes', s: ' seconds' };
  if (days > 0) parts.push(`${days}${labels.d}`);
  if (hours > 0) parts.push(`${hours}${labels.h}`);
  if (minutes > 0) parts.push(`${minutes}${labels.m}`);
  if (showSeconds && seconds > 0) parts.push(`${seconds}${labels.s}`);
  if (parts.length === 0) {
    return showSeconds ? `0${labels.s}` : `0${labels.m}`;
  }
  return parts.slice(0, maxUnits).join(' ');
};
export const formatClockTime = (
  ms: number,
  options: { showHours?: boolean; showSeconds?: boolean } = {}
): string => {
  const { showHours = true, showSeconds = true } = options;
  const { hours, minutes, seconds } = msToComponents(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (showHours) {
    return showSeconds
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}`;
  }
  const totalMinutes = hours * 60 + minutes;
  return showSeconds
    ? `${pad(totalMinutes)}:${pad(seconds)}`
    : pad(totalMinutes);
};
export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return 'Time\'s up';
  const { hours, minutes, seconds } = msToComponents(ms);
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} left`;
};
export const formatTimeOfDay = (
  date: Date,
  options: { use24Hour?: boolean; showSeconds?: boolean } = {}
): string => {
  const { use24Hour = false, showSeconds = false } = options;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (use24Hour) {
    return showSeconds
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}`;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return showSeconds
    ? `${hour12}:${pad(minutes)}:${pad(seconds)} ${period}`
    : `${hour12}:${pad(minutes)} ${period}`;
};
export const formatDate = (
  date: Date,
  options: {
    format?: 'short' | 'medium' | 'long';
    includeYear?: boolean;
  } = {}
): string => {
  const { format = 'medium', includeYear = true } = options;
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  switch (format) {
    case 'short':
      return includeYear
        ? `${month + 1}/${day}/${year}`
        : `${month + 1}/${day}`;
    case 'long':
      return includeYear
        ? `${monthNames[month]} ${day}, ${year}`
        : `${monthNames[month]} ${day}`;
    case 'medium':
    default:
      return includeYear
        ? `${shortMonthNames[month]} ${day}, ${year}`
        : `${shortMonthNames[month]} ${day}`;
  }
};
export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  return formatDate(date);
};
export const formatDateTime = (
  date: Date,
  options: { use24Hour?: boolean } = {}
): string => {
  return `${formatDate(date)} at ${formatTimeOfDay(date, options)}`;
};
export const formatDateKey = (date: Date | number = new Date()): string => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const formatNumber = (
  num: number,
  options: { decimals?: number; locale?: string } = {}
): string => {
  const { decimals, locale = 'en-US' } = options;
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
};
export const formatPercentage = (
  value: number,
  options: { decimals?: number; includeSymbol?: boolean } = {}
): string => {
  const { decimals = 0, includeSymbol = true } = options;
  const formatted = (value * 100).toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
};
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
};
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(capitalize).join(' ');
};
export const truncate = (
  str: string,
  maxLength: number,
  options: { ellipsis?: string; wordBoundary?: boolean } = {}
): string => {
  const { ellipsis = '...', wordBoundary = false } = options;
  if (str.length <= maxLength) return str;
  let truncated = str.slice(0, maxLength - ellipsis.length);
  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }
  return truncated + ellipsis;
};
export const getInitials = (name: string, maxLength: number = 2): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, maxLength).toUpperCase();
  }
  return parts
    .slice(0, maxLength)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
};
export const formatScreenTime = (ms: number): string => {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours === 0) {
    return `${minutes}m`;
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};
export const formatStreak = (days: number): string => {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day streak';
  return `${days} day streak`;
};
export const formatPoints = (points: number): string => {
  return formatCompactNumber(points);
};
export const formatLevelProgress = (current: number, required: number): string => {
  return `${formatNumber(current)} / ${formatNumber(required)} XP`;
};
export const formatUsageLimit = (limitMs: number, usedMs: number): string => {
  const remaining = Math.max(0, limitMs - usedMs);
  const percentage = (usedMs / limitMs) * 100;
  if (remaining === 0) {
    return 'Limit reached';
  }
  return `${formatScreenTime(remaining)} remaining (${Math.round(percentage)}% used)`;
};
