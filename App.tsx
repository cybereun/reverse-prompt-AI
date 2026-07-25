import React, { useState, useEffect } from 'react';
import Analyzer from './components/Analyzer';
import Generator from './components/Generator';
import History from './components/History';
import ApiKeyModal from './components/ApiKeyModal';
import { HistoryItem } from './types';
import { Camera, Zap, Layers, FolderOpen, Key } from 'lucide-react';
import { hasStoredApiKey } from './services/apiKeyStorage';

type Tab = 'analyze' | 'generate' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analyze');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sharedPrompt, setSharedPrompt] = useState<string>("");
  const [sharedSourceImage, setSharedSourceImage] = useState<string | null>(null);
  
  // API Key Modal State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isKeySetLocally, setIsKeySetLocally] = useState(false);

  useEffect(() => {
    setIsKeySetLocally(hasStoredApiKey());
  }, []);

  const handleKeyUpdated = () => {
    setIsKeySetLocally(hasStoredApiKey());
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const handlePromptGenerated = (prompt: string, sourceImage?: string | null) => {
    setSharedPrompt(prompt);
    setSharedSourceImage(sourceImage || null);
    setActiveTab('generate');
  };

  const handleHistoryPromptSelect = (prompt: string) => {
    setSharedPrompt(prompt);
    setActiveTab('generate');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hidden xs:inline">
                역프롬프트 이미지 생성 AI
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Navigation Tabs */}
              <div className="flex space-x-1">
                {[
                  { id: 'analyze', label: '이미지 분석', icon: Camera },
                  { id: 'generate', label: '이미지 생성', icon: Layers },
                  { id: 'history', label: '히스토리', icon: FolderOpen },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                        ${isActive 
                          ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* API Key Settings Button */}
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  isKeySetLocally
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
                title="Gemini API 키 설정 (로컬 저장)"
              >
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">API 키 설정</span>
                <span className={`w-2 h-2 rounded-full ${isKeySetLocally ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="min-h-[calc(100vh-8rem)]">
          <div style={{ display: activeTab === 'analyze' ? 'block' : 'none' }} className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">이미지 분석 스튜디오</h1>
              <p className="text-zinc-400">참조 이미지에서 전문가급 프롬프트와 기술적 사양을 추출합니다.</p>
            </div>
            <Analyzer 
              onPromptGenerated={handlePromptGenerated} 
              onSaveToHistory={addToHistory}
              onApiKeyRequired={() => setIsApiKeyModalOpen(true)}
            />
          </div>

          <div style={{ display: activeTab === 'generate' ? 'block' : 'none' }} className="animate-fade-in">
             <div className="mb-6">
               <h1 className="text-3xl font-bold text-white mb-2">역프롬프트 이미지 생성 AI</h1>
               <p className="text-zinc-400">최적화된 프롬프트로 놀라운 예술 작품을 만들어보세요.</p>
             </div>
            <Generator 
              initialPrompt={sharedPrompt} 
              initialSourceImage={sharedSourceImage}
              onSaveToHistory={addToHistory}
              onApiKeyRequired={() => setIsApiKeyModalOpen(true)}
            />
          </div>

          <div style={{ display: activeTab === 'history' ? 'block' : 'none' }} className="animate-fade-in">
             <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">기록 및 갤러리</h1>
                <p className="text-zinc-400">과거 분석 및 생성 기록을 확인하세요.</p>
              </div>
            <History items={history} onSelectPrompt={handleHistoryPromptSelect} />
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center">
        <p className="text-xs text-zinc-600">
          Powered by Google Gemini Models • Server-Side API Proxy for Security
        </p>
      </footer>
    </div>
  );
}

export default App;
