const DAY_MS = 24 * 60 * 60 * 1000;

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, Entry<T>>();

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttl = DAY_MS) {
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }
}

export const imageCache = new TTLCache<ArrayBuffer>();
