# Reverse Prompt Image Generation AI

[한국어](README.md) | [English](README_EN.md)

> A Gemini and OpenAI-powered image studio that reverse-engineers reference images into professional English prompts and brings prompt enhancement, generation, transformation, and iterative editing together in one interface.

[![Developer](https://img.shields.io/badge/Developer-Lebi%20(Cybereun)-7C3AED?style=for-the-badge&logo=github&logoColor=white)](https://github.com/cybereun)
[![Repository](https://img.shields.io/badge/GitHub-reverse--prompt--AI-181717?style=for-the-badge&logo=github)](https://github.com/cybereun/reverse-prompt-AI)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google-Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

<p align="center">
  <img src="docs/images/app-screenshot.png" alt="Reverse Prompt Image Generation AI application screen" width="100%">
</p>

<p align="center">
  <sub>Image Generation Studio — manage a reference image, prompt, pose library, and generated result in one workspace.</sub>
</p>

## Table of Contents

- [About the App](#about-the-app)
- [Example Results](#example-results)
- [Highlights](#highlights)
- [Features](#features)
- [How to Use](#how-to-use)
- [Installation and Setup](#installation-and-setup)
- [API Key Configuration](#api-key-configuration)
- [Project Structure](#project-structure)
- [Technology and Request Flow](#technology-and-request-flow)
- [Server API](#server-api)
- [Build and Deployment](#build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Current Limitations and Important Notes](#current-limitations-and-important-notes)
- [Developer](#developer)

## About the App

**Reverse Prompt Image Generation AI** analyzes the subject, lighting, camera, composition, color, and atmosphere of a reference image with Google Gemini. It turns those visual properties into a reusable English prompt for AI image generation.

The application connects the complete workflow instead of stopping after prompt extraction:

```text
Upload a reference image
  → Run a full or technical analysis
  → Extract and enhance an English prompt
  → Generate with Text-to-Image or Image-to-Image
  → Apply pose and scene edits
  → Download results and reuse session history
```

You can also start with a Korean description. The prompt enhancement feature translates and expands it into a detailed English prompt suitable for image generation.

## Example Results

The following examples use the original image as a reference and apply this app's Image-to-Image and iterative editing features to change the pose, situation, and background.

### Original Image

<p align="center">
  <img src="docs/images/example-original.png" alt="Original image before editing with the app" width="360">
</p>

<p align="center">
  <sub>Original — a person standing inside a subway car</sub>
</p>

### Results Edited with the App

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/images/example-edited-subway.jpg" alt="Subway scene with pose and situation edited by the app" width="100%">
    </td>
    <td align="center" width="50%">
      <img src="docs/images/example-edited-stairs.jpg" alt="Staircase scene with pose and background edited by the app" width="100%">
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Edited Result 1</strong><br>The pose and situation are changed while retaining the subway setting.</td>
    <td align="center"><strong>Edited Result 2</strong><br>The character styling is carried into a new pose and staircase setting.</td>
  </tr>
</table>

> Generation and editing results may vary depending on the prompt, reference image, Gemini model version, and execution time.

## Highlights

| Highlight | Description |
| --- | --- |
| Reverse image prompting | Extracts a detailed English generation prompt from a reference image. |
| Two analysis modes | Offers **Full Analysis** for scene recreation and **Technical Analysis** for reusable photographic style. |
| Prompt enhancement | Expands short or Korean input into professional English with camera, lighting, and color-grading terminology. |
| Text-to-Image | Creates a new image from a text prompt. |
| Image-to-Image | Uses a reference image and prompt together to preserve or transform style, lighting, and composition. |
| Iterative image editing | Applies additional pose or situation instructions to the generated result. |
| Pose library | Adds categorized pose descriptions to the edit prompt with one click. |
| Multiple aspect ratios | Supports `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, and `21:9`. |
| Session history | Collects analysis and generation results in a gallery for quick reuse during the current session. |
| Image downloads | Saves generated images and history items as PNG files. |
| Multiple AI providers | Switch between Google Gemini and OpenAI while keeping the same workflow. |
| Provider-specific local keys | Store and delete Gemini and OpenAI keys separately in the user's browser. |
| Responsive dark UI | Provides a studio-style interface for desktop and mobile screens. |
| PWA metadata | Includes a web app manifest and application icons. |

## Features

### 1. Image Analysis

Select an image by clicking the upload area or drag and drop it into the app. The input accepts image formats recognized by the browser, including JPG, PNG, and WebP.

#### Full Analysis

- Subject appearance, pose, and clothing
- Light quality, direction, source, and color
- Lens, focal length, and depth of field
- Mood and atmosphere
- Color grading and palette
- One cohesive English prompt intended to recreate the original scene

#### Technical Analysis

- Excludes descriptions of specific people and objects
- Lighting setup and light direction
- Color temperature and palette
- Lens characteristics, aperture, and bokeh
- Camera angle and composition
- Film or digital sensor texture
- Produces a reusable style prompt that can be combined with any subject

Additional instructions can be entered alongside the image and are incorporated into the analysis. When only text is provided, the app can pass it directly into the result prompt without running image analysis.

### 2. Prompt Enhancement

An extracted or manually entered prompt can be expanded into professional English with details such as:

- Camera characteristics inspired by ARRI or Sony Venice
- Film looks such as Kodak Portra
- Lighting language such as volumetric fog and chiaroscuro
- Color-grading terms such as teal and orange or bleach bypass
- Specific, visual phrasing suitable for advanced image-generation models

The enhanced prompt can be copied or transferred directly to the Image Generation tab.

### 3. Image Generation

- Enter only a prompt to use **Text-to-Image**.
- Upload a reference image as well to use **Image-to-Image**.
- Select the desired aspect ratio before generation.
- Preview the result and download it immediately.

### 4. Iterative Image Editing

After generating an image, enter additional instructions and send the current result back to the Gemini image model.

- Change a character's pose
- Add an action or situation
- Change the background, lighting, or atmosphere
- Click an item in the pose library to append it to the edit prompt
- Combine multiple pose and scene instructions over repeated edits

### 5. History

Analysis and generation results are automatically added to the application's in-memory history during the current session.

- View result images and prompts
- Distinguish full analysis, technical analysis, and generated images
- Download an image
- Copy a prompt
- Send a selected prompt back to the generation workspace

> History is not currently persisted to the server or browser storage. Refreshing the page or closing the app clears it.

## How to Use

### First-Time Setup

1. Start the app and open `http://localhost:3000`.
2. Select **Gemini** or **OpenAI** in the top navigation.
3. Click **API 키 설정** (API Key Settings) and open the desired provider tab.
4. Enter a key issued by Google AI Studio or OpenAI Platform.
5. Save the key. The status indicator turns green when it is available.

If `GEMINI_API_KEY` is already configured on the server, users do not need to register a separate browser key.

### Extract a Prompt from an Image

1. Open the **이미지 분석** (Image Analysis) tab.
2. Upload an image.
3. Select **전체 분석** (Full Analysis) or **기술 분석** (Technical Analysis).
4. Optionally enter additional instructions.
5. Click **이미지 분석 시작** (Start Image Analysis).
6. Copy the result or run **프롬프트 업그레이드** (Prompt Upgrade).
7. Send the result to the generation tab with **이미지 생성으로 이동**.

### Generate a New Image

1. Open the **이미지 생성** (Image Generation) tab.
2. Enter a prompt.
3. Upload a reference image if you want to use Image-to-Image.
4. Select an aspect ratio.
5. Click **생성** (Generate), or **변환** (Transform) when a reference image is attached.
6. Download the finished image from the button in the upper-right corner of the preview.

### Edit a Generated Image

1. Generate an image first.
2. Enter the requested change under **수정(포즈/상황 추가)**.
3. Optionally open a pose-library category and select a pose.
4. Click **적용** (Apply).
5. Adjust the instructions and repeat until you are satisfied.

### Reuse a Previous Prompt

1. Open the **히스토리** (History) tab.
2. Click **사용** (Use) on the desired card.
3. The prompt is copied to the clipboard and loaded into the generation tab.

## Installation and Setup

### Requirements

- [Node.js](https://nodejs.org/) 20 or later recommended
- npm 10 or later recommended
- A Google Gemini API key
- A current version of Chrome, Edge, Firefox, or Safari

### 1. Clone the Repository

```bash
git clone https://github.com/cybereun/reverse-prompt-AI.git
cd reverse-prompt-AI
```

### 2. Install Dependencies

```bash
npm install
```

The repository also contains `bun.lock`, so Bun users can run:

```bash
bun install
```

Choose either npm or Bun consistently within a project to avoid lockfile conflicts.

### 3. Configure the API Key

Create a `.env` file in the project root based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Alternatively, leave the server key unset and register a user key through **API 키 설정** after launching the app.

### 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

In development mode, Express provides the API while Vite serves the frontend in middleware mode.

### 5. Build and Run for Production

```bash
npm run build
npm start
```

The build output is written to `dist/`. Express serves both the static frontend and API routes.

### Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Runs Express and Vite on port `3000`. |
| `npm run build` | Builds the Vite frontend and bundled Express server. |
| `npm start` | Runs the compiled `dist/server.cjs` server. |

## API Key Configuration

Gemini and OpenAI keys can be registered and deleted independently in the settings modal.

### Browser Local Storage

Keys are separated by provider in the current browser's `localStorage`.

| Provider | Local-storage key | Proxy request header |
| --- | --- | --- |
| Gemini | `user_gemini_api_key` | `x-gemini-api-key` |
| OpenAI | `user_openai_api_key` | `x-openai-api-key` |

Only the selected provider's key is sent to the same-origin Express proxy. OpenAI keys are not stored in server environment variables, files, or databases and are used only for the current request. Gemini retains its existing `GEMINI_API_KEY` and `API_KEY` server fallback for compatibility.

This keeps the key out of source code and Git history, but JavaScript running in the browser and browser developer tools can still access it. Do not use this approach on a shared computer or in a browser with untrusted extensions.

### Obtain a Key

- Gemini: [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
- OpenAI: [OpenAI Platform API Keys](https://platform.openai.com/api-keys)

A ChatGPT subscription and OpenAI API billing are separate. Model availability, pricing, and quotas depend on each provider's account and project policy.

## Project Structure

```text
reverse-prompt-AI/
├─ components/
│  ├─ Analyzer.tsx         # Image analysis and prompt enhancement UI
│  ├─ Generator.tsx        # Generation, Img2Img, editing, and downloads
│  ├─ History.tsx          # Session history and prompt reuse
│  ├─ ApiKeyModal.tsx      # Browser API-key management
│  └─ AppIcon.tsx          # Application icon component
├─ data/
│  └─ poses.ts             # Pose-library data
├─ docs/images/            # README screenshots and result examples
├─ public/
│  ├─ manifest.json        # PWA web app manifest
│  └─ icon.*, favicon.*    # Application icons and favicons
├─ services/
│  ├─ geminiService.ts     # Server API client and browser fallback
│  └─ apiKeyStorage.ts     # Browser API-key storage
├─ App.tsx                 # Tabs, shared prompts, and history state
├─ server.ts               # Express server and Gemini API proxy
├─ types.ts                # Analysis modes, aspect ratios, and history types
├─ vite.config.ts          # Vite development and build configuration
├─ package.json            # Dependencies and scripts
└─ .env.example            # Environment-variable example
```

## Technology and Request Flow

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS loaded from CDN
- Lucide React icons

### Backend

- Node.js
- Express
- Google Gen AI SDK (`@google/genai`)
- OpenAI JavaScript SDK (`openai`)
- CORS
- Vite middleware integration in development

### Models

| Purpose | Model |
| --- | --- |
| Image analysis | `gemini-3.6-flash` |
| Prompt enhancement | `gemini-3.6-flash` |
| Image generation | `gemini-3.1-flash-image` |
| Reference-image transformation and iterative editing | `gemini-3.1-flash-image` |
| OpenAI image analysis and prompt enhancement | `gpt-5.6` |
| OpenAI image generation and editing | `gpt-image-2` |

Model names and availability may change with Google Gemini API policies. When changing a model, update both the server and browser implementations in `server.ts` and `services/geminiService.ts`.

### Request Flow

1. The user selects Gemini or OpenAI in the top navigation.
2. The frontend includes `provider` in the body and sends only the selected provider's key in a request header.
3. The server calls the selected provider and does not persist OpenAI keys.
4. The frontend displays the server response.
5. Gemini retains the existing browser-SDK fallback for static-hosting compatibility. OpenAI requests require the Express proxy to be running.
6. If the selected provider has no key, the API key settings dialog opens.

Image data is sent as Base64 or a Data URL. The Express request-body limit is currently `50mb`.

## Server API

| Method | Path | Purpose | Main Input |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Check server health | None |
| `POST` | `/api/analyze` | Run full or technical image analysis | `provider`, `imageBase64`, `mimeType`, `mode`, `additionalInput` |
| `POST` | `/api/enhance` | Enhance a prompt in English | `provider`, `prompt` |
| `POST` | `/api/generate` | Generate an image from text | `provider`, `prompt`, `aspectRatio` |
| `POST` | `/api/edit` | Generate or edit from a reference image | `provider`, `imageBase64`, `prompt`, `aspectRatio` |

If no API key is available, the server returns HTTP `401` with `API_KEY_REQUIRED`.

## Build and Deployment

### Self-Hosted Node.js Server

```bash
npm run build
NODE_ENV=production npm start
```

On Windows PowerShell:

```powershell
$env:NODE_ENV = "production"
npm start
```

For production, consider adding:

- HTTPS
- A process manager or container
- A reverse proxy
- Request-size and rate limits
- Server-side API-key management
- Error and usage monitoring

### Static Hosting

Static hosting serves only the frontend and does not run the Express `/api/*` endpoints. In that environment, users need a browser-stored API key for the client fallback, or the project needs a separate serverless/backend API.

The current `vercel.json` only configures SPA rewrites. Running the server APIs on Vercel requires additional work, such as moving the Express endpoints into Vercel Functions.

## Troubleshooting

### `API_KEY_REQUIRED`

- Confirm that a valid key is registered under **API 키 설정**.
- For server mode, verify `GEMINI_API_KEY` in `.env` or the deployment environment.
- Restart the development server after changing `.env`.

### Analysis or Generation Is Blocked

- Check whether the request conflicts with Gemini safety policies.
- Confirm model access and API quota.
- Try again later or rewrite the request more clearly.

### The Model Returns Text Instead of an Image

The app reports an error when the image model does not return image data. Rewrite the prompt with concise and strongly visual language, then retry.

### Image Upload Fails

- Confirm that the file is an image.
- Reduce the dimensions or file size of very large images.
- The server request-body limit is currently `50mb`.

### Port `3000` Is Already in Use

The server port is currently set to `3000` in `server.ts`. Stop the process using that port or change the port setting in the server code.

### History Disappears

History currently lives only in React memory. Losing it after a page refresh is expected behavior.

## Current Limitations and Important Notes

- Gemini and OpenAI usage and charges are applied to the project that owns the selected key.
- Results depend on the model, account permissions, safety policies, and quota.
- History is not persistent and lasts only for the current application session.
- A browser-stored API key is not embedded in the source, but users or scripts that can inspect `localStorage` and request headers may access it.
- Uploaded images and prompts are sent to Google APIs for Gemini processing. Check your organization's security and privacy rules before using sensitive material.
- The repository currently has no separate `LICENSE` file. Contact the developer about usage terms before redistribution or commercial use.

## Developer

[![Lebi (Cybereun)](https://img.shields.io/badge/Lebi%20(Cybereun)-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/cybereun)

- **Developer:** Lebi (Cybereun)
- **GitHub:** [@cybereun](https://github.com/cybereun)
- **Repository:** [cybereun/reverse-prompt-AI](https://github.com/cybereun/reverse-prompt-AI)

Please use GitHub Issues for bug reports and improvement suggestions.

---

Made with React, TypeScript, Express, and Google Gemini by **Lebi (Cybereun)**.
