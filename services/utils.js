export const blockPriority = {
  Morning: 0,
  Afternoon: 1,
  Evening: 2,
};

export function getPreviousDateStr(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}