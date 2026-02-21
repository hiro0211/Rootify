// Mock AsyncStorage for unit tests
const store: Record<string, string> = {};

export const storage = {
  getItem: async <T>(key: string): Promise<T | null> => {
    const value = store[key];
    if (value === undefined) return null;
    return JSON.parse(value) as T;
  },
  setItem: async <T>(key: string, value: T): Promise<void> => {
    store[key] = JSON.stringify(value);
  },
  removeItem: async (key: string): Promise<void> => {
    delete store[key];
  },
  clear: async (): Promise<void> => {
    Object.keys(store).forEach((key) => delete store[key]);
  },
};
