import { AIProvider } from "../types";

const STORAGE_KEYS: Record<AIProvider, string> = {
  gemini: "user_gemini_api_key",
  openai: "user_openai_api_key"
};

const PROVIDER_STORAGE_KEY = "selected_ai_provider";

export const getStoredApiKey = (provider: AIProvider = "gemini"): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS[provider]) || "";
};

export const setStoredApiKey = (provider: AIProvider, key: string): void => {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEYS[provider], trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEYS[provider]);
  }
};

export const removeStoredApiKey = (provider: AIProvider): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS[provider]);
};

export const hasStoredApiKey = (provider: AIProvider = "gemini"): boolean => {
  return !!getStoredApiKey(provider);
};

export const getSelectedProvider = (): AIProvider => {
  if (typeof window === "undefined") return "gemini";
  return localStorage.getItem(PROVIDER_STORAGE_KEY) === "openai" ? "openai" : "gemini";
};

export const setSelectedProvider = (provider: AIProvider): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
};
