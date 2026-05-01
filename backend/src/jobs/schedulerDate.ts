export const getSchedulerTargetMonthDate = (now: Date, timeZone: string): Date => {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(now);

  const year = Number.parseInt(parts.find((part) => part.type === 'year')?.value ?? '', 10);
  const month = Number.parseInt(parts.find((part) => part.type === 'month')?.value ?? '', 10);

  if (!year || !month) {
    throw new Error(`Unable to resolve scheduler target month for timezone ${timeZone}`);
  }

  return new Date(Date.UTC(year, month - 1, 1));
};
