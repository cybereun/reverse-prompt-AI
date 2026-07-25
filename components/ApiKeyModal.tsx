import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { AIProvider } from "../types";
import {
  getStoredApiKey,
  hasStoredApiKey,
  removeStoredApiKey,
  setStoredApiKey
} from "../services/apiKeyStorage";

interface ApiKeyModalProps {
  isOpen: boolean;
  initialProvider: AIProvider;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

const PROVIDERS: Array<{
  id: AIProvider;
  name: string;
  placeholder: string;
  keyUrl: string;
  keyLinkLabel: string;
  accent: string;
}> = [
  {
    id: "gemini",
    name: "Gemini",
    placeholder: "AIzaSy...",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyLinkLabel: "Google AI Studio에서 발급",
    accent: "blue"
  },
  {
    id: "openai",
    name: "OpenAI",
    placeholder: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
    keyLinkLabel: "OpenAI Platform에서 발급",
    accent: "emerald"
  }
];

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, initialProvider, onClose, onKeyUpdated }) => {
  const [activeProvider, setActiveProvider] = useState<AIProvider>("gemini");
  const [keyInputs, setKeyInputs] = useState<Record<AIProvider, string>>({
    gemini: "",
    openai: ""
  });
  const [showKey, setShowKey] = useState(false);
  const [savedProvider, setSavedProvider] = useState<AIProvider | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setKeyInputs({
      gemini: getStoredApiKey("gemini"),
      openai: getStoredApiKey("openai")
    });
    setActiveProvider(initialProvider);
    setShowKey(false);
    setSavedProvider(null);
  }, [isOpen, initialProvider]);

  if (!isOpen) return null;

  const current = PROVIDERS.find((provider) => provider.id === activeProvider)!;
  const hasCurrentKey = hasStoredApiKey(activeProvider);
  const accentClasses =
    current.accent === "emerald"
      ? {
          icon: "bg-emerald-600/20 border-emerald-500/30 text-emerald-400",
          focus: "focus:ring-emerald-500",
          button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
          link: "text-emerald-400 hover:text-emerald-300"
        }
      : {
          icon: "bg-blue-600/20 border-blue-500/30 text-blue-400",
          focus: "focus:ring-blue-500",
          button: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
          link: "text-blue-400 hover:text-blue-300"
        };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    setStoredApiKey(activeProvider, keyInputs[activeProvider]);
    setSavedProvider(activeProvider);
    onKeyUpdated?.();
    window.setTimeout(() => setSavedProvider(null), 1800);
  };

  const handleClear = () => {
    removeStoredApiKey(activeProvider);
    setKeyInputs((previous) => ({ ...previous, [activeProvider]: "" }));
    setSavedProvider(null);
    onKeyUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accentClasses.icon}`}>
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI API 키 설정</h3>
            <p className="text-xs text-zinc-400">Gemini와 OpenAI 키를 이 브라우저에 각각 보관합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5">
          {PROVIDERS.map((provider) => {
            const isActive = provider.id === activeProvider;
            const isSaved = hasStoredApiKey(provider.id);
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => {
                  setActiveProvider(provider.id);
                  setShowKey(false);
                  setSavedProvider(null);
                }}
                className={`py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? provider.id === "openai"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {provider.name}
                <span className={`w-2 h-2 rounded-full ${isSaved ? "bg-emerald-300" : "bg-zinc-600"}`} />
              </button>
            );
          })}
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>소스 코드 비노출 · 브라우저 로컬 저장</span>
          </div>
          <p className="leading-relaxed">
            키는 GitHub나 빌드 파일에 포함되지 않고 현재 브라우저의 localStorage에 저장됩니다.
            개인용 컴퓨터에서 사용하고, 다른 컴퓨터에서는 사용 후 반드시 삭제하세요.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs bg-zinc-950 px-3.5 py-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400">{current.name} 키 상태:</span>
          {hasCurrentKey ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> 로컬 저장소 등록됨
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> 미등록
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              {current.name} API Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? "text" : "password"}
                value={keyInputs[activeProvider]}
                onChange={(event) =>
                  setKeyInputs((previous) => ({
                    ...previous,
                    [activeProvider]: event.target.value
                  }))
                }
                placeholder={current.placeholder}
                autoComplete="off"
                spellCheck={false}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 ${accentClasses.focus} focus:border-transparent font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowKey((visible) => !visible)}
                className="absolute right-3 text-zinc-400 hover:text-white p-1"
                title={showKey ? "숨기기" : "보기"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {savedProvider === activeProvider && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {current.name} API 키를 로컬 저장소에 저장했습니다.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!keyInputs[activeProvider].trim()}
              className={`flex-1 py-2.5 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${accentClasses.button}`}
            >
              <Save className="w-4 h-4" />
              {current.name} 키 저장
            </button>
            {hasCurrentKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 bg-zinc-800 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 border border-zinc-700/60 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
                title={`${current.name} 키 삭제`}
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center text-xs gap-3">
          <span className="text-zinc-500">API 키가 없으신가요?</span>
          <a
            href={current.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${accentClasses.link} flex items-center gap-1 font-medium transition-colors text-right`}
          >
            {current.keyLinkLabel} <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
