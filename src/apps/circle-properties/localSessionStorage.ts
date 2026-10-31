type StoragePort = Pick<Storage, "getItem" | "setItem">;

/** Keep unsaved work authoritative while a browser quota or permission fails. */
export function createSessionStorage(
  getStorage: () => StoragePort | undefined,
) {
  const memory = new Map<string, unknown>();
  const unsaved = new Set<string>();
  return {
    read(key: string): { raw: unknown; failed: boolean } {
      if (unsaved.has(key)) return { raw: memory.get(key), failed: true };
      try {
        const stored = getStorage()?.getItem(key);
        return {
          raw: stored == null ? memory.get(key) : JSON.parse(stored),
          failed: false,
        };
      } catch {
        return { raw: memory.get(key), failed: true };
      }
    },
    write(key: string, value: unknown): boolean {
      memory.set(key, value);
      try {
        const storage = getStorage();
        if (!storage) throw new Error("Browser storage unavailable");
        storage.setItem(key, JSON.stringify(value));
        unsaved.delete(key);
        return true;
      } catch {
        unsaved.add(key);
        return false;
      }
    },
    clearMemory() {
      memory.clear();
      unsaved.clear();
    },
  };
}
