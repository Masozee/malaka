/**
 * Decode a JWT token payload without verification.
 * Client-side only — the server already verified it on issue.
 */
export interface JwtClaims {
  sub: string;        // userID
  email: string;
  role: string;
  company_id: string;
  exp: number;        // expiry timestamp (seconds)
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims) return true;
  return Date.now() / 1000 > claims.exp;
}
