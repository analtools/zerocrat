function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
}
