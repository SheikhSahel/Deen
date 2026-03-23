type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = memory.get(key);

  if (!bucket || now > bucket.resetAt) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  memory.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.count };
}
