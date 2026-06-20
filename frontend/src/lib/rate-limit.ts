// Simple in-memory rate limiter for route handlers. Persists per-process
// (sufficient behind a single PM2 instance). For multi-instance deployments,
// swap for Redis-backed limiter.
export type RateState = { count: number; resetTime: number };

const buckets = new Map<string, RateState>();

export function rateLimited(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

export function getClientIP(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}