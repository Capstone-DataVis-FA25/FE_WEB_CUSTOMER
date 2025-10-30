import dayjs from 'dayjs';

// Format an ISO-like date/time string using a dayjs pattern.
// Returns original value if invalid or empty.
export const formatDateUsingDayjs = (value: string | null | undefined, pattern: string): string => {
  if (!value) return '';
  const d = dayjs(value);
  if (!d.isValid()) return String(value);
  return d.format(pattern);
};
