import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import OpenAI, { toFile } from "openai";
import { AIProvider, AnalysisMode, AspectRatio } from "./types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const getProvider = (req: express.Request): AIProvider =>
    req.body?.provider === "openai" ? "openai" : "gemini";

  // User OpenAI keys are request-only and are never read from or written to server storage.
  const getApiKey = (req: express.Request, provider: AIProvider): string | null => {
    const headerKey =
      provider === "openai"
        ? req.headers["x-openai-api-key"]
        : req.headers["x-gemini-api-key"] || req.headers["x-api-key"];
    if (typeof headerKey === "string" && headerKey.trim().length > 0) {
      return headerKey.trim();
    }
    if (provider === "openai") {
      return null;
    }
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
      return process.env.GEMINI_API_KEY.trim();
    }
    if (process.env.API_KEY && process.env.API_KEY.trim().length > 0) {
      return process.env.API_KEY.trim();
    }
    return null;
  };

  const openAIImageSize = (aspectRatio: AspectRatio): string => {
    const sizes: Record<AspectRatio, string> = {
      "16:9": "1536x864",
      "9:16": "864x1536",
      "1:1": "1024x1024",
      "4:3": "1344x1008",
      "3:4": "1008x1344",
      "21:9": "1536x672"
    };
    return sizes[aspectRatio] || sizes["16:9"];
  };

  const parseDataUrl = (imageBase64: string, fallbackMimeType = "image/png") => {
    if (!imageBase64.includes(",")) {
      return { data: imageBase64, mimeType: fallbackMimeType };
    }
    const [metadata, data] = imageBase64.split(",", 2);
    const mimeType = metadata.match(/data:(.*?);/)?.[1] || fallbackMimeType;
    return { data, mimeType };
  };

  const commonSafetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Analyze Image
  app.post("/api/analyze", async (req, res) => {
    try {
      const provider = getProvider(req);
      const apiKey = getApiKey(req, provider);
      if (!apiKey) {
        return res.status(401).json({
          error: "API_KEY_REQUIRED",
          message: `${provider === "openai" ? "OpenAI" : "Gemini"} API 키가 설정되어 있지 않습니다. 상단 [API 키 설정] 버튼에서 키를 저장해주세요.`
        });
      }

      const { imageBase64, mimeType, mode, additionalInput } = req.body;
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: "이미지 데이터가 필요합니다." });
      }

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

      if (additionalInput && typeof additionalInput === "string" && additionalInput.trim()) {
        prompt += `\n\nAdditional User Instruction/Context (Incorporate this into the analysis): "${additionalInput.trim()}"`;
      }

      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const response = await openai.responses.create({
          model: "gpt-5.6",
          reasoning: { effort: "none" },
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                {
                  type: "input_image",
                  image_url: `data:${mimeType || "image/png"};base64,${cleanBase64}`,
                  detail: "high"
                }
              ]
            }
          ]
        });
        return res.json({ prompt: response.output_text || "Analysis failed to produce text." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/png"
              }
            },
            { text: prompt }
          ]
        }
      });

      res.json({ prompt: response.text || "Analysis failed to produce text." });
    } catch (err: any) {
      console.error("API /api/analyze error:", err?.message || "Unknown error");
      res.status(500).json({ error: err.message || "이미지 분석 실패" });
    }
  });

  // 2. Enhance Prompt
  app.post("/api/enhance", async (req, res) => {
    try {
      const provider = getProvider(req);
      const apiKey = getApiKey(req, provider);
      if (!apiKey) {
        return res.status(401).json({
          error: "API_KEY_REQUIRED",
          message: `${provider === "openai" ? "OpenAI" : "Gemini"} API 키가 설정되어 있지 않습니다. 상단 [API 키 설정] 버튼에서 키를 저장해주세요.`
        });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "프롬프트가 필요합니다." });
      }

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

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const response = await openai.responses.create({
          model: "gpt-5.6",
          reasoning: { effort: "none" },
          instructions: systemInstruction,
          input: `Enhance this prompt:\n"${prompt}"`
        });
        return res.json({ prompt: response.output_text || prompt });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Enhance this prompt:\n"${prompt}"`,
        config: {
          systemInstruction
        }
      });

      res.json({ prompt: response.text || prompt });
    } catch (err: any) {
      console.error("API /api/enhance error:", err?.message || "Unknown error");
      res.status(500).json({ error: err.message || "프롬프트 개선 실패" });
    }
  });

  // 3. Generate Image
  app.post("/api/generate", async (req, res) => {
    try {
      const provider = getProvider(req);
      const apiKey = getApiKey(req, provider);
      if (!apiKey) {
        return res.status(401).json({
          error: "API_KEY_REQUIRED",
          message: `${provider === "openai" ? "OpenAI" : "Gemini"} API 키가 설정되어 있지 않습니다. 상단 [API 키 설정] 버튼에서 키를 저장해주세요.`
        });
      }

      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "프롬프트가 필요합니다." });
      }

      const validAspectRatio = (aspectRatio || "16:9") as AspectRatio;

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const response = await openai.images.generate({
          model: "gpt-image-2",
          prompt,
          size: openAIImageSize(validAspectRatio) as any,
          quality: "medium",
          output_format: "png"
        });
        const imageBase64 = response.data?.[0]?.b64_json;
        if (!imageBase64) {
          return res.status(500).json({ error: "OpenAI 응답에서 이미지 데이터를 찾을 수 없습니다." });
        }
        return res.json({ imageUrl: `data:image/png;base64,${imageBase64}` });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio
          },
          safetySettings: commonSafetySettings
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== "STOP") {
        return res.status(400).json({ error: `이미지 생성 차단됨: ${candidate.finishReason}` });
      }

      for (const part of candidate?.content?.parts || []) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || "image/png";
          const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          return res.json({ imageUrl });
        }
      }

      res.status(500).json({ error: "응답에서 이미지 데이터를 찾을 수 없습니다." });
    } catch (err: any) {
      console.error("API /api/generate error:", err?.message || "Unknown error");
      res.status(500).json({ error: err.message || "이미지 생성 실패" });
    }
  });

  // 4. Edit Image
  app.post("/api/edit", async (req, res) => {
    try {
      const provider = getProvider(req);
      const apiKey = getApiKey(req, provider);
      if (!apiKey) {
        return res.status(401).json({
          error: "API_KEY_REQUIRED",
          message: `${provider === "openai" ? "OpenAI" : "Gemini"} API 키가 설정되어 있지 않습니다. 상단 [API 키 설정] 버튼에서 키를 저장해주세요.`
        });
      }

      const { imageBase64, prompt, aspectRatio } = req.body;
      if (!imageBase64 || !prompt) {
        return res.status(400).json({ error: "이미지 데이터와 프롬프트가 필요합니다." });
      }

      const { data: cleanBase64, mimeType } = parseDataUrl(imageBase64);

      const finalPrompt = `Generate a high-quality image based on the attached reference and this description: ${prompt}. \n\nEnsure the style, lighting, and composition align with the reference where appropriate, but fully implement the described changes.`;

      const validAspectRatio = (aspectRatio || "9:16") as AspectRatio;

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const extension = mimeType.includes("jpeg") ? "jpg" : mimeType.split("/")[1] || "png";
        const sourceImage = await toFile(
          Buffer.from(cleanBase64, "base64"),
          `reference.${extension}`,
          { type: mimeType }
        );
        const response = await openai.images.edit({
          model: "gpt-image-2",
          image: sourceImage,
          prompt: finalPrompt,
          size: openAIImageSize(validAspectRatio) as any,
          quality: "medium",
          output_format: "png"
        });
        const imageBase64Result = response.data?.[0]?.b64_json;
        if (!imageBase64Result) {
          return res.status(500).json({ error: "OpenAI 응답에서 이미지 데이터를 찾을 수 없습니다." });
        }
        return res.json({ imageUrl: `data:image/png;base64,${imageBase64Result}` });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

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
            aspectRatio: validAspectRatio
          },
          safetySettings: commonSafetySettings
        }
      });

      const candidate = response.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== "STOP") {
        return res.status(400).json({ error: `이미지 수정 차단됨: ${candidate.finishReason}` });
      }

      let textResponse = "";
      for (const part of candidate?.content?.parts || []) {
        if (part.inlineData) {
          const resMime = part.inlineData.mimeType || "image/png";
          const imageUrl = `data:${resMime};base64,${part.inlineData.data}`;
          return res.json({ imageUrl });
        }
        if (part.text) {
          textResponse += part.text;
        }
      }

      if (textResponse.length > 0) {
        const displayMsg = textResponse.length > 100 ? textResponse.substring(0, 100) + "..." : textResponse;
        return res.status(400).json({ error: `모델이 이미지 대신 텍스트를 반환했습니다: "${displayMsg}"` });
      }

      res.status(500).json({ error: "응답에서 이미지 데이터를 찾을 수 없습니다." });
    } catch (err: any) {
      console.error("API /api/edit error:", err?.message || "Unknown error");
      res.status(500).json({ error: err.message || "이미지 수정 실패" });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
