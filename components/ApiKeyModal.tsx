import React, { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, Trash2, ExternalLink, X, CheckCircle, ShieldCheck, Lock } from "lucide-react";
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from "../services/apiKeyStorage";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredApiKey();
      setKeyInput(current);
      setHasExistingKey(!!current);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(keyInput);
    setHasExistingKey(!!keyInput.trim());
    setSavedSuccess(true);
    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    removeStoredApiKey();
    setKeyInput("");
    setHasExistingKey(false);
    if (onKeyUpdated) onKeyUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5 text-zinc-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gemini API 키 설정</h3>
            <p className="text-xs text-zinc-400">내 로컬 드라이브(브라우저 저장소)에 안전하게 보관됩니다.</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>F12 노출 방지 & 로컬 전용 저장</span>
          </div>
          <p className="leading-relaxed">
            API 키는 사용자 본인의 브라우저 내 로컬 스토리지에 저장되며, 개발자 도구(F12) 빌드 소스에 절대 인라인 배치되거나 노출되지 않습니다.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between text-xs bg-zinc-950 px-3.5 py-2.5 rounded-lg border border-zinc-800">
          <span className="text-zinc-400">현재 키 상태:</span>
          {hasExistingKey ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> 로컬 저장소 등록됨
            </span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> 미등록 (서버 기본 키 사용 또는 필요)
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Gemini API Key (Google AI Studio)
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-zinc-400 hover:text-white p-1"
                title={showKey ? "숨기기" : "보기"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alert Box for Success */}
          {savedSuccess && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> API 키가 로컬 저장소에 안전하게 저장되었습니다!
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              로컬에 저장
            </button>
            {hasExistingKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 bg-zinc-800 hover:bg-red-950/50 hover:text-red-400 text-zinc-400 border border-zinc-700/60 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
                title="키 삭제"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
        </form>

        {/* Get Key Link */}
        <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-center text-xs">
          <span className="text-zinc-500">API 키가 없으신가요?</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
          >
            Google AI Studio에서 무료 발급받기 <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default ApiKeyModal;
