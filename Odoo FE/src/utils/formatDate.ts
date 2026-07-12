export function formatDate(date: Date | string | number, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {};

  if (format === 'short') {
    return d.toLocaleDateString();
  } else if (format === 'medium') {
    options.month = 'short';
    options.day = 'numeric';
    options.year = 'numeric';
  } else {
    options.month = 'long';
    options.day = 'numeric';
    options.year = 'numeric';
    options.weekday = 'long';
  }

  return d.toLocaleDateString(undefined, options);
}

export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Time';
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
