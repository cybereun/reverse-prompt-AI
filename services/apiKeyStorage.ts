const STORAGE_KEY = "user_gemini_api_key";

export const getStoredApiKey = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

export const setStoredApiKey = (key: string): void => {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const removeStoredApiKey = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const hasStoredApiKey = (): boolean => {
  return !!getStoredApiKey();
};
