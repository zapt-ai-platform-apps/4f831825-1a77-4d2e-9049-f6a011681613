export const isPrevDisabled = (currentMonth, minDate) => {
  // Always allow going back to previous months
  return false;
};

export const isNextDisabled = (currentMonth, maxDate) => {
  if (!maxDate || !currentMonth) return false;
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  return nextMonth > maxMonth;
};

export const formatMonthYear = (currentMonth, Sentry) => {
  if (!currentMonth) return 'Loading...';
  try {
    return currentMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    Sentry.captureException(error);
    return 'Invalid Date';
  }
};

export const getPrevNextMonthNames = (currentMonth) => {
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const prevMonthName = prevMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const nextMonthName = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return { prevMonthName, nextMonthName };
};