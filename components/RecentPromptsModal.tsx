import React, { useEffect, useState } from 'react';
import { Prompt } from '../types';
import { getRecentPrompts } from '../services/db';

interface RecentPromptsModalProps {
  onClose: () => void;
  onPromptClick: (prompt: Prompt) => void;
}

const RecentPromptsModal: React.FC<RecentPromptsModalProps> = ({ onClose, onPromptClick }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      setIsLoading(true);
      try {
        const data = await getRecentPrompts(50); // Fetch top 50 recent
        if (isMounted) setPrompts(data);
      } catch (e) {
        console.error("Failed to fetch recent prompts", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRecent();
    return () => { isMounted = false; };
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-solar-base03/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 3D Modal Content */}
      <div className="relative w-full max-w-2xl modal-3d rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-solar-base02 shadow-md z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-solar-green flex items-center justify-center text-solar-base03 shadow-[2px_2px_5px_rgba(0,0,0,0.2)]">
                <i className="fas fa-clock text-xl"></i>
             </div>
             <h2 className="text-2xl font-black text-solar-base3 uppercase drop-shadow-sm">Recently Added</h2>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-red text-solar-base3"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-solar-base03">
          {isLoading ? (
             <div className="flex flex-col gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 bg-solar-base02 rounded-2xl animate-pulse shadow-md"></div>
                ))}
             </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-20 text-solar-base01">
              <i className="far fa-clock text-4xl mb-4 opacity-50 drop-shadow-md"></i>
              <p>No recent prompts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.map(prompt => (
                <div 
                  key={prompt.id}
                  onClick={() => onPromptClick(prompt)}
                  className="card-3d p-5 rounded-2xl cursor-pointer flex items-start gap-4 bg-solar-base02"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="tag-3d px-2 py-0.5 rounded-md text-solar-base1">
                        {prompt.category}
                      </span>
                      <span className="text-xs text-solar-green font-bold font-mono bg-solar-base03 px-2 py-0.5 rounded-md shadow-sm">
                         {formatTimeAgo(prompt.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-solar-base3 mb-1">
                      {prompt.title}
                    </h3>
                    <p className="text-solar-base1 text-sm line-clamp-1 mb-2">
                      {prompt.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-solar-base01 font-bold">
                      <span><i className="fas fa-user mr-1"></i>{prompt.author}</span>
                      <span className="text-solar-red"><i className="fas fa-heart mr-1"></i> {prompt.likes}</span>
                    </div>
                  </div>
                  
                  <div className="self-center">
                    <i className="fas fa-chevron-right text-solar-base01 text-xl drop-shadow-sm"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentPromptsModal;