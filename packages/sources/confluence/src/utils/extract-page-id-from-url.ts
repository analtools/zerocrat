export function extractPageIdFromUrl(url: string): string | null {
  const match: any = url.match(/pageId=(\d+)/);
  return match ? match[1] : null;
}
