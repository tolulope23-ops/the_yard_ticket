export function addTimeToDate(
  value: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days',
  fromDate: Date = new Date()
): Date {
  const unitToMs = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
  };

  return new Date(fromDate.getTime() + value * unitToMs[unit]);
};