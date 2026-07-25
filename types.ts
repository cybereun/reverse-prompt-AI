
export enum AnalysisMode {
  FULL = 'FULL',
  TECHNICAL = 'TECHNICAL'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'analysis' | 'generation';
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  mode?: AnalysisMode;
}

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";

export const ASPECT_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
