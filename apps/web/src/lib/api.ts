const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured',
  );
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${API_URL}${normalizedPath}`;
}
