import { AnalysisMode, AspectRatio } from "../types";
import { getStoredApiKey } from "./apiKeyStorage";

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  const apiKey = getStoredApiKey();
  if (apiKey) {
    headers["x-gemini-api-key"] = apiKey;
  }
  return headers;
};

// Helper to convert File to base64
const fileToBase64 = async (file: File): Promise<{ base64Data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const parts = base64String.split(",");
      resolve({
        base64Data: parts[1] || parts[0],
        mimeType: file.type || "image/png"
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImage = async (file: File, mode: AnalysisMode, additionalInput?: string): Promise<string> => {
  try {
    const { base64Data, mimeType } = await fileToBase64(file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType,
        mode,
        additionalInput
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || data.error === "API_KEY_REQUIRED") {
        throw new Error("API_KEY_REQUIRED");
      }
      throw new Error(data.message || data.error || "이미지 분석 실패");
    }

    return data.prompt;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const res = await fetch("/api/enhance", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ prompt: originalPrompt })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || data.error === "API_KEY_REQUIRED") {
        throw new Error("API_KEY_REQUIRED");
      }
      throw new Error(data.message || data.error || "프롬프트 업그레이드 실패");
    }

    return data.prompt;
  } catch (error: any) {
    console.error("Enhancement Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ prompt, aspectRatio })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || data.error === "API_KEY_REQUIRED") {
        throw new Error("API_KEY_REQUIRED");
      }
      throw new Error(data.message || data.error || "이미지 생성 실패");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Generation Error:", error);
    throw error;
  }
};

export const editImage = async (base64Image: string, prompt: string, aspectRatio: AspectRatio = "9:16"): Promise<string> => {
  try {
    const res = await fetch("/api/edit", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ imageBase64: base64Image, prompt, aspectRatio })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || data.error === "API_KEY_REQUIRED") {
        throw new Error("API_KEY_REQUIRED");
      }
      throw new Error(data.message || data.error || "이미지 수정 실패");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Edit Error:", error);
    throw error;
  }
};
