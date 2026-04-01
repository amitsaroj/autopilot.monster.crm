export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: parse document.cookie
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    return match ? match[2] : null;
  }
  // This helps prevent throwing Next.js server context errors if directly called in a standard util,
  // but in Server Components you should use `cookies()` directly from `next/headers`.
  return null;
}

export function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
