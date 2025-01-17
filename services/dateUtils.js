export function getPreviousDateStr(dateStr) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // zero-based
  const day = parseInt(parts[2], 10);

  const currentDate = new Date(year, month, day);
  currentDate.setDate(currentDate.getDate() - 1);

  const prevYear = currentDate.getFullYear();
  const prevMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const prevDay = String(currentDate.getDate()).padStart(2, '0');
  return `${prevYear}-${prevMonth}-${prevDay}`;
}