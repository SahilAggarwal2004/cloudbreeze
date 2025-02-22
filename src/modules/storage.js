const getStorageInstance = (local = true) => (local ? localStorage : sessionStorage);

export const setStorage = (key, value, local = true) => getStorageInstance(local).setItem(key, JSON.stringify(value));

export const removeStorage = (key, local = true) => getStorageInstance(local).removeItem(key);

export function getStorage(key, fallbackValue = null, local = true) {
  const value = getStorageInstance(local).getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      removeStorage(key, local); // Remove corrupted data
    }
  }
  if (fallbackValue !== null && fallbackValue !== undefined) setStorage(key, fallbackValue, local);
  return fallbackValue;
}
