import React, { useState, useRef, useEffect } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { AspectRatio, ASPECT_RATIOS, HistoryItem } from '../types';
import { POSE_CATEGORIES } from '../data/poses';
import { Loader2, Wand2, Download, Image as ImageIcon, RotateCcw, Sparkles, X, Camera, ChevronDown, ChevronRight, Eraser, Palette } from 'lucide-react';

interface GeneratorProps {
  initialPrompt?: string;
  initialSourceImage?: string | null;
  onSaveToHistory: (item: HistoryItem) => void;
  onApiKeyRequired?: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ initialPrompt = "", initialSourceImage = null, onSaveToHistory, onApiKeyRequired }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Source Image State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isDraggingSource, setIsDraggingSource] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit specific state
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Pose Selector State
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Update local state if prop changes
  useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
       setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Handle incoming source image from Analyzer
  useEffect(() => {
    setSourceImage(initialSourceImage);
  }, [initialSourceImage]);

  // Source Image Handlers
  const handleSourceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      readSourceFile(file);
    }
  };

  const handleSourceDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSource(true);
  };

  const handleSourceDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSource(false);
  };

  const handleSourceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSource(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        readSourceFile(file);
      } else {
        alert("이미지 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const readSourceFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSourceImage = () => {
    setSourceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setEditPrompt(""); // Reset edit prompt on new generation
    try {
      let base64Image;
      // If source image exists, use it as input (Image-to-Image)
      if (sourceImage) {
        base64Image = await editImage(sourceImage, prompt, aspectRatio);
      } else {
        // Otherwise standard Text-to-Image
        base64Image = await generateImage(prompt, aspectRatio);
      }
      
      setGeneratedImage(base64Image);
      onSaveToHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'generation',
        imageUrl: base64Image,
        prompt: sourceImage ? `(Img2Img) ${prompt}` : prompt,
        aspectRatio: aspectRatio
      });
    } catch (err: any) {
      if (err?.message === 'API_KEY_REQUIRED' || err?.message?.includes('API_KEY_REQUIRED')) {
        onApiKeyRequired?.();
      } else {
        alert(`이미지 생성에 실패했습니다: ${err.message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt.trim()) return;
    setIsEditing(true);
    try {
      const base64Image = await editImage(generatedImage, editPrompt, aspectRatio);
      setGeneratedImage(base64Image);
      onSaveToHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'generation',
        imageUrl: base64Image,
        prompt: `Edited: ${editPrompt} (Origin: ${prompt.slice(0, 30)}...)`,
        aspectRatio: aspectRatio
      });
    } catch (err: any) {
      if (err?.message === 'API_KEY_REQUIRED' || err?.message?.includes('API_KEY_REQUIRED')) {
        onApiKeyRequired?.();
      } else {
        alert(`이미지 수정에 실패했습니다: ${err.message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setEditPrompt("");
    setGeneratedImage(null);
    setAspectRatio("16:9");
    clearSourceImage();
  };
  
  const handleClearEditPrompt = () => {
    setEditPrompt("");
  };

  const handleAddPose = (poseDescription: string) => {
    setEditPrompt(prev => {
      if (prev.trim()) return `${prev}\n${poseDescription}`;
      return poseDescription;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lumina-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-11rem)]">
      
      {/* LEFT: Controls & Inputs (Studio) */}
      <div className="lg:col-span-3 xl:col-span-3 flex flex-col h-auto lg:h-full min-h-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm h-full flex flex-col overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-green-400" />
              스튜디오
            </h2>
            <button 
              onClick={handleReset}
              className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              title="모두 초기화"
            >
              <RotateCcw className="w-3 h-3" /> 초기화
            </button>
          </div>

          <div className="space-y-4 flex-1">
            
            {/* Source Image Upload */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-zinc-400">참조 이미지</label>
              {sourceImage ? (
                <div className="relative rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden aspect-video group">
                  <img src={sourceImage} alt="Source" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <button 
                    onClick={clearSourceImage}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                    Img2Img
                  </div>
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-lg aspect-video flex flex-col items-center justify-center cursor-pointer transition-all
                    ${isDraggingSource 
                      ? 'border-green-500 bg-zinc-800/80' 
                      : 'border-zinc-700 hover:border-green-500 hover:bg-zinc-800/50'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleSourceDragOver}
                  onDragLeave={handleSourceDragLeave}
                  onDrop={handleSourceDrop}
                >
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Camera className="w-3 h-3" />
                    <span className="text-[10px]">업로드</span>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleSourceImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Main Prompt */}
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">프롬프트</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="상상하는 이미지를 묘사하세요..."
                className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:ring-1 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">비율</label>
              <div className="grid grid-cols-2 gap-1">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1 text-[10px] font-medium rounded border transition-all
                      ${aspectRatio === ratio 
                        ? 'bg-green-600 border-green-500 text-white' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'}
                    `}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all
                ${isGenerating || !prompt.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'}`}
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {isGenerating ? '생성 중...' : (sourceImage ? '변환' : '생성')}
            </button>
            
            {/* Edit Section */}
            <div className="pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 수정 (포즈/상황 추가)
                </label>
                {editPrompt && (
                    <button 
                        onClick={handleClearEditPrompt}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                        title="수정 내용 지우기"
                    >
                        <Eraser className="w-3 h-3" />
                    </button>
                )}
              </div>
              
              <div className="space-y-2">
                 <div className="relative">
                   <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="오른쪽 포즈 라이브러리 클릭 또는 직접 입력..."
                    className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none resize-none placeholder:text-zinc-600"
                  />
                </div>
                
                <button
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt.trim() || !generatedImage}
                  className={`w-full py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all
                    ${isEditing || !editPrompt.trim() || !generatedImage
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-purple-900/50 hover:bg-purple-900 text-purple-200 border border-purple-500/30'}`}
                >
                  {isEditing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  {generatedImage ? (isEditing ? '수정 중...' : '적용') : '이미지 필요'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MIDDLE: Pose Library (Independent Scroll Container) */}
      <div className="lg:col-span-3 flex flex-col h-[400px] lg:h-full min-h-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm h-full flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 flex-shrink-0">
                <Palette className="w-5 h-5 text-purple-400" /> 포즈 라이브러리
            </h3>
            
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {POSE_CATEGORIES.map((category) => (
                <div key={category.id} className="border border-zinc-800 rounded-xl bg-zinc-950/50 hover:border-purple-500/30 transition-all overflow-hidden">
                  <button 
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                       <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{category.emoji}</span>
                       <div className="flex flex-col min-w-0">
                           <span className="text-base font-bold text-white truncate leading-snug">{category.title.split(':')[1]?.trim() || category.title}</span>
                           <span className="text-xs text-zinc-300 truncate mt-0.5 font-normal">{category.description}</span>
                       </div>
                    </div>
                    {expandedCategory === category.id 
                      ? <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0 ml-1" /> 
                      : <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0 ml-1" />}
                  </button>
                  
                  {expandedCategory === category.id && (
                    <div className="px-3 pb-3 bg-zinc-950/90 border-t border-zinc-800/80 animate-fade-in">
                       <div className="space-y-1.5 mt-2.5">
                         {category.items.map((item, idx) => (
                           <button
                             key={idx}
                             onClick={() => handleAddPose(item)}
                             className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-zinc-200 hover:text-purple-200 hover:bg-purple-950/60 rounded-lg transition-colors leading-relaxed border-l-2 border-transparent hover:border-purple-400 whitespace-normal break-keep"
                             title="클릭하여 수정 프롬프트에 추가"
                           >
                             {item}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* RIGHT: Preview Window (Pinned at top, doesn't jump or move down) */}
      <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-[500px] lg:h-full min-h-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 relative overflow-hidden flex items-center justify-center h-full">
          {generatedImage ? (
             <img 
               src={generatedImage} 
               alt="Generated Art" 
               className="max-w-full max-h-full object-contain rounded shadow-2xl"
             />
          ) : (
            <div className="text-zinc-600 flex flex-col items-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-15 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-500">생성된 이미지가 여기에 표시됩니다</p>
            </div>
          )}
          
          {/* Download Overlay */}
          {generatedImage && (
            <div className="absolute top-4 right-4">
               <button 
                 onClick={downloadImage}
                 className="p-3 bg-zinc-900/80 backdrop-blur-md hover:bg-white hover:text-black text-white rounded-full transition-all shadow-xl border border-white/10"
                 title="이미지 다운로드"
               >
                 <Download className="w-5 h-5" />
               </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Generator;
