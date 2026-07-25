import React, { useState, useRef } from 'react';
import { AIProvider, AnalysisMode, HistoryItem } from '../types';
import { analyzeImage, enhancePrompt } from '../services/geminiService';
import { Upload, Camera, Zap, Copy, RotateCcw, ArrowRight, Wand2, Loader2, Image as ImageIcon, FileText } from 'lucide-react';

interface AnalyzerProps {
  provider: AIProvider;
  onPromptGenerated: (prompt: string, sourceImage?: string | null) => void;
  onSaveToHistory: (item: HistoryItem) => void;
  onApiKeyRequired?: () => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ provider, onPromptGenerated, onSaveToHistory, onApiKeyRequired }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultPrompt, setResultPrompt] = useState<string>("");
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.FULL);
  const [isDragging, setIsDragging] = useState(false);
  const [additionalInput, setAdditionalInput] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processFile(file);
      } else {
        alert("이미지 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResultPrompt("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !additionalInput.trim()) return;

    // If only text is provided, just move it to result prompt
    if (!selectedFile && additionalInput.trim()) {
      setResultPrompt(additionalInput.trim());
      return;
    }

    // If file is provided (with or without text), perform analysis
    if (selectedFile) {
      setIsAnalyzing(true);
      try {
        const prompt = await analyzeImage(selectedFile, mode, additionalInput, provider);
        setResultPrompt(prompt);
        // Auto-save to history
        if (previewUrl) {
           onSaveToHistory({
              id: Date.now().toString(),
              timestamp: Date.now(),
              type: 'analysis',
              imageUrl: previewUrl,
              prompt: prompt,
              mode: mode
           });
        }
      } catch (err: any) {
        if (err?.message === 'API_KEY_REQUIRED' || err?.message?.includes('API_KEY_REQUIRED')) {
          onApiKeyRequired?.();
        } else {
          alert(`분석에 실패했습니다: ${err.message || "API 키를 확인하거나 다시 시도해주세요."}`);
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleEnhance = async () => {
    if (!resultPrompt) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(resultPrompt, provider);
      setResultPrompt(enhanced);
    } catch (err: any) {
      if (err?.message === 'API_KEY_REQUIRED' || err?.message?.includes('API_KEY_REQUIRED')) {
        onApiKeyRequired?.();
      } else {
        alert(`프롬프트 개선에 실패했습니다: ${err.message || "오류가 발생했습니다."}`);
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultPrompt);
  };

  const handleReset = () => {
    setResultPrompt("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setAdditionalInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendToGenerator = () => {
    if (!resultPrompt) return;
    // Only send the prompt, pass null for the image
    onPromptGenerated(resultPrompt, null);
  };

  const getActionButtonText = () => {
    if (isAnalyzing) return '분석 중...';
    if (selectedFile && additionalInput.trim()) return '이미지 분석 (텍스트 반영)';
    if (selectedFile) return '이미지 분석 시작';
    if (additionalInput.trim()) return '텍스트 바로 입력';
    return '이미지 분석 시작';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              이미지 업로드
            </h2>
            
            <div 
              className={`relative border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                ${previewUrl ? 'border-zinc-700 bg-zinc-950' : 
                  isDragging ? 'border-blue-500 bg-zinc-800/80 scale-[1.02]' : 
                  'border-zinc-700 hover:border-blue-500 hover:bg-zinc-800/50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg" />
              ) : (
                <div className="text-center text-zinc-400 pointer-events-none">
                  <Upload className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-zinc-500'}`} />
                  <p className="text-sm font-medium">
                    {isDragging ? '이미지를 여기에 놓으세요' : '클릭 또는 드래그하여 이미지 업로드'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">JPG, PNG, WebP</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              {/* Drag Overlay for when an image is already selected */}
              {previewUrl && isDragging && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5" /> 새 이미지로 교체
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium text-zinc-400">분석 모드</label>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setMode(AnalysisMode.FULL)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                    ${mode === AnalysisMode.FULL ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  전체 분석
                </button>
                <button
                  onClick={() => setMode(AnalysisMode.TECHNICAL)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all
                    ${mode === AnalysisMode.TECHNICAL ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  기술 분석
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                 <FileText className="w-4 h-4" /> 추가 프롬프트 / 텍스트 입력
              </label>
              <textarea
                value={additionalInput}
                onChange={(e) => setAdditionalInput(e.target.value)}
                placeholder="이미지와 함께 분석할 내용을 적거나, 여기에 직접 프롬프트를 작성하세요."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none placeholder:text-zinc-600"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!selectedFile && !additionalInput.trim()) || isAnalyzing}
              className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                ${(!selectedFile && !additionalInput.trim()) || isAnalyzing 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'}`}
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {getActionButtonText()}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              생성된 프롬프트
            </h2>

            <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 p-4 relative overflow-hidden group">
              {resultPrompt ? (
                <textarea
                  className="w-full h-full bg-transparent text-zinc-300 resize-none outline-none text-sm leading-relaxed"
                  value={resultPrompt}
                  readOnly
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                  분석 결과가 여기에 표시됩니다...
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button 
                onClick={handleCopy} 
                disabled={!resultPrompt}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> 복사
              </button>
              
              <button 
                onClick={handleEnhance} 
                disabled={!resultPrompt || isEnhancing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                프롬프트 업그레이드
              </button>

              <button 
                onClick={handleReset}
                disabled={!resultPrompt && !selectedFile && !additionalInput}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg text-sm font-medium transition-colors ml-auto disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" /> 초기화
              </button>
            </div>

            {/* Direct Send to Generator */}
            {resultPrompt && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                 <button 
                  onClick={handleSendToGenerator}
                  className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                 >
                  이미지 생성기로 이동 (프롬프트만) <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
