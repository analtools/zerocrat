export function formatDate(date: Date): string {
  const year = date.getFullYear();
  // Месяцы в JS начинаются с 0, поэтому прибавляем 1
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
