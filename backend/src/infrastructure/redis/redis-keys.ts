const KEY_PREFIX = process.env.REDIS_KEY_PREFIX ?? 'tm-korea';

export const redisTtlSeconds = {
  presence: Number(process.env.REDIS_TTL_PRESENCE ?? 45),
  lock: Number(process.env.REDIS_TTL_LOCK ?? 120),
  session: Number(process.env.REDIS_TTL_SESSION ?? 300),
} as const;

export const redisKeys = {
  prefix: KEY_PREFIX,
  documentPresence: (documentId: string) =>
    `${KEY_PREFIX}:document:${documentId}:presence`,
  documentLock: (documentId: string) =>
    `${KEY_PREFIX}:document:${documentId}:lock`,
  documentSession: (documentId: string, sessionId: string) =>
    `${KEY_PREFIX}:document:${documentId}:session:${sessionId}`,
} as const;
