export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const SESSION_KEY = 'veripass.session';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token || null;
  } catch {
    return null;
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string | null;
  skipAuth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, token, skipAuth, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);
  const authToken = token ?? (skipAuth ? null : getStoredToken());

  if (authToken) requestHeaders.set('Authorization', `Bearer ${authToken}`);
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'Cannot reach the VeriPass API. Make sure the backend is running.',
      0,
    );
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const rawMessage = data?.message ?? data?.error ?? 'Something went wrong';
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(' ')
      : String(rawMessage);
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function assetUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function verificationUrl(code: string) {
  return `${SITE_URL}/verify/${encodeURIComponent(code)}`;
}

export function referenceUrl(token: string) {
  return `${SITE_URL}/reference/${token}`;
}
