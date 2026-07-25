import React from 'react';
import { HistoryItem } from '../types';
import { Copy, Clock, Image as ImageIcon, Download } from 'lucide-react';

interface HistoryProps {
  items: HistoryItem[];
  onSelectPrompt: (prompt: string) => void;
}

const History: React.FC<HistoryProps> = ({ items, onSelectPrompt }) => {
  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `lumina-history-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Clock className="w-12 h-12 mb-4 opacity-30" />
        <p>아직 기록이 없습니다. 분석이나 생성을 시작해보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="relative aspect-video bg-zinc-950 overflow-hidden group">
            <img 
              src={item.imageUrl} 
              alt="History" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider
                  ${item.type === 'analysis' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
                  {item.type === 'analysis' ? (item.mode === 'TECHNICAL' ? '기술 분석' : '전체 분석') : '이미지 생성'}
                </span>
            </div>
            
            {/* Quick download button overlay on image */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.imageUrl, item.id);
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-zinc-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10"
                title="이미지 다운로드"
             >
                <Download className="w-4 h-4" />
             </button>
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex-1 max-h-32 overflow-y-auto scrollbar-thin mb-4">
              <p className="text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap">
                {item.prompt}
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t border-zinc-800 pt-3 mt-auto">
              <span className="text-xs text-zinc-600">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(item.imageUrl, item.id)}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  title="이미지 저장"
                >
                  <Download className="w-3 h-3" /> 저장
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(item.prompt);
                    onSelectPrompt(item.prompt);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  title="프롬프트 복사 및 생성기로 이동"
                >
                  <Copy className="w-3 h-3" /> 사용
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;