import React, { useEffect, useState } from 'react';
import { Author, Prompt } from '../types';
import { getAuthorProfile } from '../services/authorService';

interface AuthorProfileModalProps {
  authorName: string;
  allPrompts: Prompt[];
  onClose: () => void;
  onPromptClick: (prompt: Prompt) => void;
}

const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({ 
  authorName, 
  allPrompts, 
  onClose,
  onPromptClick
}) => {
  const [profile, setProfile] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAuthorProfile(authorName);
        if (isMounted) {
            setProfile(data);
        }
      } catch (e) {
        console.error("Failed to fetch author", e);
        if (isMounted) {
            setError("Failed to load author profile. Please try again later.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [authorName]);

  const authorPrompts = allPrompts.filter(p => p.author === authorName);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-solar-base03/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 3D Modal Content */}
      <div className="relative w-full max-w-2xl modal-3d rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
           <button 
            onClick={onClose}
            className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-red text-solar-base3"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* State Handling */}
        {isLoading ? (
          /* Skeleton Loader */
          <div className="flex flex-col h-full animate-pulse">
            <div className="p-8 pb-6 bg-solar-base02 text-center shadow-md z-10">
              <div className="w-28 h-28 mx-auto rounded-full bg-solar-base03 mb-4 shadow-md"></div>
              <div className="h-8 w-48 bg-solar-base03 mx-auto rounded mb-3"></div>
              <div className="h-4 w-64 bg-solar-base03/50 mx-auto rounded mb-2"></div>
            </div>
            <div className="flex-1 p-6 bg-solar-base03">
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-20 bg-solar-base02 rounded-xl shadow-md"></div>
                 ))}
               </div>
            </div>
          </div>
        ) : error ? (
            /* Error State */
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-solar-red/10 rounded-full flex items-center justify-center mb-6 text-solar-red shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)]">
                    <i className="fas fa-exclamation-triangle text-3xl"></i>
                </div>
                <h3 className="text-2xl font-black text-solar-base3 mb-2">Error Loading Profile</h3>
                <p className="text-solar-base1 mb-8 max-w-xs">{error}</p>
                <button 
                    onClick={onClose}
                    className="btn-3d btn-3d-base02 px-8 py-3 rounded-xl"
                >
                    Close
                </button>
            </div>
        ) : profile ? (
          /* Success State */
          <div className="flex flex-col h-full">
            {/* Profile Header */}
            <div className="p-8 pb-6 bg-solar-base02 text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] z-10">
              <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${profile.avatarColor || 'from-solar-base01 to-solar-base00'} p-1 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-2px_-2px_8px_rgba(255,255,255,0.05)] mb-4`}>
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full rounded-full object-cover bg-solar-base02"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-solar-base02 flex items-center justify-center text-3xl font-bold text-solar-base2 uppercase">
                    {profile.name.substring(0, 2)}
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-black text-solar-base3 mb-2 drop-shadow-sm">{profile.name}</h2>
              <p className="text-solar-base1 max-w-md mx-auto text-sm leading-relaxed mb-4 font-medium">
                {profile.bio}
              </p>
              <div className="flex justify-center gap-6 text-xs text-solar-base01 uppercase tracking-widest font-black">
                <span className="bg-solar-base03 px-3 py-1.5 rounded-lg shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]">
                  <i className="far fa-calendar-alt mr-2 text-solar-cyan"></i>
                  Joined {new Date(profile.joinedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span className="bg-solar-base03 px-3 py-1.5 rounded-lg shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]">
                  <i className="fas fa-layer-group mr-2 text-solar-violet"></i>
                  {authorPrompts.length} Prompts
                </span>
              </div>
            </div>

            {/* Author's Prompts List */}
            <div className="flex-1 overflow-y-auto bg-solar-base03 p-6">
              <h3 className="text-solar-base3 font-black uppercase mb-4 flex items-center tracking-wider text-sm drop-shadow-sm">
                <i className="fas fa-star text-solar-yellow mr-2"></i> Contributions
              </h3>
              
              <div className="space-y-4">
                {authorPrompts.length > 0 ? (
                  authorPrompts.map(prompt => (
                    <div 
                      key={prompt.id}
                      onClick={() => onPromptClick(prompt)}
                      className="card-3d p-4 rounded-xl cursor-pointer flex items-center justify-between bg-solar-base02 hover:translate-y-[-2px] transition-transform"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="tag-3d px-2 py-0.5 rounded-md text-solar-base1 text-[10px]">
                             {prompt.category}
                           </span>
                           <h4 className="text-solar-base2 font-bold truncate">
                             {prompt.title}
                           </h4>
                        </div>
                        <p className="text-solar-base01 text-xs line-clamp-1">
                          {prompt.description}
                        </p>
                      </div>
                      <div className="text-solar-base01">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-solar-base01 italic font-bold">
                    No prompts submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* User Not Found State (Fallback if no error but no profile) */
          <div className="flex flex-col h-full items-center justify-center p-8 text-center text-solar-base1 font-bold">
            <i className="fas fa-user-slash text-4xl mb-4 opacity-50"></i>
            <p>User not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfileModal;