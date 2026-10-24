/** Only observational reads use this cache. Mutations always use fresh transactions. */
export function createReadCache(now = Date.now) {
  const entries = new Map<
    string,
    { expires: number; promise: Promise<unknown> }
  >();
  return {
    async get<T>(
      key: string,
      ttl: number,
      fetch: () => Promise<T>,
    ): Promise<T> {
      const existing = entries.get(key);
      if (existing && existing.expires > now())
        return existing.promise as Promise<T>;
      if (entries.size >= 2048) entries.delete(entries.keys().next().value!);
      const entry = {
        expires: now() + ttl,
        promise: Promise.resolve().then(fetch),
      };
      entries.set(key, entry);
      try {
        const value = await entry.promise;
        if (value === undefined && entries.get(key) === entry)
          entries.delete(key);
        return value;
      } catch (error) {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      }
    },
    drop(key: string) {
      entries.delete(key);
    },
  };
}
