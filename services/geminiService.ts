import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AIProvider, AnalysisMode, AspectRatio } from "../types";
import { getStoredApiKey } from "./apiKeyStorage";

const getHeaders = (provider: AIProvider): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  const apiKey = getStoredApiKey(provider);
  if (apiKey) {
    headers[provider === "openai" ? "x-openai-api-key" : "x-gemini-api-key"] = apiKey;
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

const commonSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// --- Client-side Gemini SDK Runners (Fallback for Static Hosts like Vercel) ---

const clientAnalyzeImage = async (apiKey: string, file: File, mode: AnalysisMode, additionalInput?: string): Promise<string> => {
  const { base64Data, mimeType } = await fileToBase64(file);
  const ai = new GoogleGenAI({ apiKey });

  let prompt = "";
  if (mode === AnalysisMode.FULL) {
    prompt = `
    Analyze the attached image and generate a highly detailed AI image generation prompt in English.
    
    Focus on:
    1. Subject description (pose, appearance, clothing)
    2. Lighting (quality, direction, source, color)
    3. Camera specifics (lens type, focal length, depth of field)
    4. Mood and Atmosphere
    5. Color Grading and Palette
    
    The output should be a single, cohesive paragraph in English that could be pasted into an image generator to recreate this exact scene.
    `;
  } else {
    prompt = `
    Perform a TECHNICAL PHOTOGRAPHY ANALYSIS of the attached image.
    
    CRITICAL INSTRUCTION: DO NOT describe the specific people, characters, or specific objects in the scene. 
    Focus ONLY on the pure photography and cinematographic elements that define the "style".
    
    Your output must describe:
    1. Lighting Setup (e.g., Rembrandt, butterfly, neon, diffuse, harsh shadows)
    2. Light Sources & Direction
    3. Color Palette & Temperature
    4. Lens Characteristics (Focal length estimate, e.g., 35mm, 85mm, anamorphic)
    5. Aperture/Depth of Field (Bokeh quality)
    6. Camera Angle & Composition technique
    7. Film Stock or Digital Sensor characteristics (grain, ISO noise, sharpness)

    Format the output as a "Style Prompt" in English that a user can combine with ANY subject matter to achieve this exact look.
    `;
  }

  if (additionalInput && additionalInput.trim()) {
    prompt += `\n\nAdditional User Instruction/Context (Incorporate this into the analysis): "${additionalInput.trim()}"`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || "image/png"
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "Analysis failed to produce text.";
};

const clientEnhancePrompt = async (apiKey: string, originalPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `
  You are a world-class Prompt Engineer and Cinematographer. 
  Your task is to take a raw user input (which may be an existing prompt, a scene description, or a script snippet in ANY language including Korean) and "upscale" it into a professional-grade English masterpiece prompt for AI image generation.
  
  1. Preserve the core intent of the original scene. If the input is Korean, translate the meaning accurately into the English prompt.
  2. Add specific technical details (camera models like ARRI, Sony Venice, film stocks like Kodak Portra).
  3. Enhance lighting descriptions (volumetric fog, subsurface scattering, chiaroscuro).
  4. Refine color grading terminology (teal and orange, bleach bypass, pastel tones).
  5. Ensure the language is evocative and precise for high-end AI image generators.
  6. OUTPUT MUST BE IN ENGLISH only, as this yields the best image generation results.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Enhance this prompt:\n"${originalPrompt}"`,
    config: {
      systemInstruction
    }
  });

  return response.text || originalPrompt;
};

const clientGenerateImage = async (apiKey: string, prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image",
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio
      },
      safetySettings: commonSafetySettings
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`이미지 생성 차단됨: ${candidate.finishReason}`);
  }

  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("응답에서 이미지 데이터를 찾을 수 없습니다.");
};

const clientEditImage = async (apiKey: string, base64Image: string, prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  let mimeType = "image/png";
  let cleanBase64 = base64Image;

  if (base64Image.includes(",")) {
    const parts = base64Image.split(",");
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  const finalPrompt = `Generate a high-quality image based on the attached reference and this description: ${prompt}. \n\nEnsure the style, lighting, and composition align with the reference where appropriate, but fully implement the described changes.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType
          }
        },
        { text: finalPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio
      },
      safetySettings: commonSafetySettings
    }
  });

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`이미지 수정 차단됨: ${candidate.finishReason}`);
  }

  let textResponse = "";
  for (const part of candidate?.content?.parts || []) {
    if (part.inlineData) {
      const resMime = part.inlineData.mimeType || "image/png";
      return `data:${resMime};base64,${part.inlineData.data}`;
    }
    if (part.text) {
      textResponse += part.text;
    }
  }

  if (textResponse.length > 0) {
    const displayMsg = textResponse.length > 100 ? textResponse.substring(0, 100) + "..." : textResponse;
    throw new Error(`모델이 이미지 대신 텍스트를 반환했습니다: "${displayMsg}"`);
  }

  throw new Error("응답에서 이미지 데이터를 찾을 수 없습니다.");
};

// Helper for calling API route with fallback to client SDK
async function fetchApi<T>(
  endpoint: string,
  body: any,
  extractResult: (data: any) => T,
  provider: AIProvider,
  clientFallback?: (apiKey: string) => Promise<T>
): Promise<T> {
  const storedKey = getStoredApiKey(provider);
  let res: Response;

  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: getHeaders(provider),
      body: JSON.stringify({ ...body, provider })
    });
  } catch (err: any) {
    console.warn(`[API Endpoint Warning] ${endpoint} unreachable.`, err);
    if (provider === "gemini" && storedKey && clientFallback) {
      return clientFallback(storedKey);
    }
    if (storedKey) {
      throw new Error("OpenAI 요청을 처리할 앱 서버에 연결할 수 없습니다.");
    }
    throw new Error("API_KEY_REQUIRED");
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (res.ok) {
      return extractResult(data);
    }
    if (res.status === 401 || data.error === "API_KEY_REQUIRED") {
      if (provider === "gemini" && storedKey && clientFallback) {
        return clientFallback(storedKey);
      }
      throw new Error("API_KEY_REQUIRED");
    }
    throw new Error(data.message || data.error || "요청 처리 실패");
  }

  if (provider === "gemini" && storedKey && clientFallback) {
    return clientFallback(storedKey);
  }

  throw new Error("앱 서버가 올바른 JSON 응답을 반환하지 않았습니다.");
}

// --- Main Service Exports ---

export const analyzeImage = async (
  file: File,
  mode: AnalysisMode,
  additionalInput?: string,
  provider: AIProvider = "gemini"
): Promise<string> => {
  const { base64Data, mimeType } = await fileToBase64(file);
  return fetchApi(
    "/api/analyze",
    { imageBase64: base64Data, mimeType, mode, additionalInput },
    (data) => data.prompt,
    provider,
    (apiKey) => clientAnalyzeImage(apiKey, file, mode, additionalInput)
  );
};

export const enhancePrompt = async (originalPrompt: string, provider: AIProvider = "gemini"): Promise<string> => {
  return fetchApi(
    "/api/enhance",
    { prompt: originalPrompt },
    (data) => data.prompt,
    provider,
    (apiKey) => clientEnhancePrompt(apiKey, originalPrompt)
  );
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  provider: AIProvider = "gemini"
): Promise<string> => {
  return fetchApi(
    "/api/generate",
    { prompt, aspectRatio },
    (data) => data.imageUrl,
    provider,
    (apiKey) => clientGenerateImage(apiKey, prompt, aspectRatio)
  );
};

export const editImage = async (
  base64Image: string,
  prompt: string,
  aspectRatio: AspectRatio = "9:16",
  provider: AIProvider = "gemini"
): Promise<string> => {
  return fetchApi(
    "/api/edit",
    { imageBase64: base64Image, prompt, aspectRatio },
    (data) => data.imageUrl,
    provider,
    (apiKey) => clientEditImage(apiKey, base64Image, prompt, aspectRatio)
  );
};
