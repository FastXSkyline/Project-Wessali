export function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  token?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${cleanBaseUrl(baseUrl)}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const record = data as { message?: string } | null;
    throw new Error(record?.message ?? `HTTP ${response.status}`);
  }
  return data as T;
}
