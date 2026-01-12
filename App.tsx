import React, { useState, useMemo, useEffect, useRef } from 'react';
import ThreeBackground from './components/ThreeBackground';
import PromptModal from './components/PromptModal';
import SubmitPromptModal from './components/SubmitPromptModal';
import AuthorProfileModal from './components/AuthorProfileModal';
import RecentPromptsModal from './components/RecentPromptsModal';
import PopularPromptsModal from './components/PopularPromptsModal';
import { Prompt, PromptCategory } from './types';
import { createPrompt, getCategoryCounts, getPromptsPaginated, incrementCopy, toggleLike, updatePrompt } from './services/db';
import { clearUserApiKey, hasUserApiKey, setUserApiKey } from './services/geminiService';

const ITEMS_PER_PAGE = 100;

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'All'>('All');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Data State
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  
  // Loading & Init State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [isPopularModalOpen, setIsPopularModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [isUserApiKeySet, setIsUserApiKeySet] = useState(hasUserApiKey());
  
  // Author Profile State
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(true);

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeApp = async () => {
      let attempt = 0;
      while (true) {
        try {
          await Promise.all([loadPrompts(1, 'All', '', true), updateCounts(true)]);
          setIsInitializing(false);
          return;
        } catch (err) {
          attempt += 1;
          console.error("Init Failed:", err);
          const delayMs = Math.min(2000, 250 * attempt);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    };

    initializeApp().catch(() => {});
  }, []);

  useEffect(() => {
    const open = () => {
      setApiKeyInput('');
      setApiKeyError('');
      setIsApiKeyModalOpen(true);
    };
    const onChanged = () => setIsUserApiKeySet(hasUserApiKey());
    window.addEventListener('pv:openApiKeyModal', open);
    window.addEventListener('pv:apiKeyChanged', onChanged);
    return () => {
      window.removeEventListener('pv:openApiKeyModal', open);
      window.removeEventListener('pv:apiKeyChanged', onChanged);
    };
  }, []);

  const openApiKeyModal = () => {
    setApiKeyInput('');
    setApiKeyError('');
    setIsApiKeyModalOpen(true);
  };

  const closeApiKeyModal = () => {
    if (isSavingApiKey) return;
    setIsApiKeyModalOpen(false);
    setApiKeyError('');
  };

  const saveApiKey = async () => {
    if (isSavingApiKey) return;
    const key = apiKeyInput.trim();
    if (key.length < 10) {
      setApiKeyError('Please enter a valid Gemini API key.');
      return;
    }

    setIsSavingApiKey(true);
    try {
      setUserApiKey(key);
      setIsUserApiKeySet(true);
      setIsApiKeyModalOpen(false);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const clearApiKey = () => {
    clearUserApiKey();
    setIsUserApiKeySet(false);
  };

  const updateCounts = async (throwOnError: boolean = false) => {
    try {
      const counts = await getCategoryCounts();
      setCategoryCounts(counts);
    } catch (e) {
      console.error("Failed to fetch counts", e);
      if (throwOnError) throw e;
    }
  };

  // --- DATA LOADING ---
  const loadPrompts = async (page: number, cat: PromptCategory | 'All', query: string, throwOnError: boolean = false) => {
    setIsLoadingPrompts(true);
    try {
      const result = await getPromptsPaginated(page, ITEMS_PER_PAGE, cat, query);
      if (result.prompts.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPrompts(result.prompts);
    } catch (e) {
      console.error("Failed to load prompts", e);
      if (throwOnError) throw e;
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  // Handle Filter Changes
  useEffect(() => {
    if (!isInitializing) {
      setCurrentPage(1);
      // Debounce search
      const timer = setTimeout(() => {
        loadPrompts(1, selectedCategory, searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, isInitializing]);

  // Handle Page Changes
  useEffect(() => {
    if (!isInitializing && currentPage > 1) {
       loadPrompts(currentPage, selectedCategory, searchQuery);
    }
  }, [currentPage]);


  // Scroll Listener for "Scroll to Top" button attached to the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const totalScroll = container.scrollTop;
      const height = container.scrollHeight - container.clientHeight;
      
      if (totalScroll > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      if (height > 0) {
        const progress = Math.round((totalScroll / height) * 100);
        setScrollProgress(progress);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isInitializing]); // Re-attach when init done

  const handleToggleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await toggleLike(id);
      setPrompts(prevPrompts => prevPrompts.map(p => (
        p.id === id ? { ...p, likes: res.likes, likedByMe: res.liked } : p
      )));

      setSelectedPrompt(prev => (prev && prev.id === id ? { ...prev, likes: res.likes, likedByMe: res.liked } : prev));
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleCopyIncrement = async (id: string) => {
    try {
      const res = await incrementCopy(id);
      setPrompts(prevPrompts => prevPrompts.map(p => (
        p.id === id ? { ...p, copies: res.copies } : p
      )));
      setSelectedPrompt(prev => (prev && prev.id === id ? { ...prev, copies: res.copies } : prev));
    } catch (err) {
      console.error("Failed to increment copy", err);
    }
  };

  const handleAddPrompt = async (newPrompt: Prompt) => {
    try {
      const saved = await createPrompt(newPrompt);
      setPrompts(prev => [saved, ...prev]);
      updateCounts();
    } catch (err) {
      console.error("Failed to save prompt", err);
    }
  };

  const handleUpdatePrompt = async (updatedPrompt: Prompt) => {
    try {
      const existing = prompts.find((p) => p.id === updatedPrompt.id) || selectedPrompt;
      if (
        existing &&
        existing.id === updatedPrompt.id &&
        existing.title === updatedPrompt.title &&
        existing.description === updatedPrompt.description &&
        existing.content === updatedPrompt.content &&
        existing.category === updatedPrompt.category &&
        (existing.myRating || 0) !== (updatedPrompt.myRating || 0)
      ) {
        setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? { ...p, myRating: updatedPrompt.myRating } : p));
        setSelectedPrompt(updatedPrompt);
        return;
      }

      const saved = await updatePrompt(updatedPrompt);
      setPrompts(prev => prev.map(p => p.id === saved.id ? saved : p));
      setSelectedPrompt(saved);
      updateCounts();
    } catch (err) {
      console.error("Failed to update prompt", err);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent, authorName: string) => {
    e.stopPropagation();
    setSelectedAuthor(authorName);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden text-solar-base1 font-sans selection:bg-solar-cyan selection:text-solar-base03 bg-solar-base03">
      <ThreeBackground />
      
      {/* Navbar - Full Width, Fixed Height */}
      <nav className="z-40 w-full bg-solar-base03/90 backdrop-blur-md flex-none h-24 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b-0">
        <div className="w-full px-4 sm:px-6 lg:px-12 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <img 
                src="/assets/logo.png" 
                alt="PromptVerse" 
                className="w-[180px] h-[80px] object-contain transform hover:-translate-y-1 transition-transform cursor-pointer" 
              />
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setIsPopularModalOpen(true)}
                className="btn-3d btn-3d-base02 px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
              >
                <i className="fas fa-fire mr-2 text-solar-orange"></i> Popular
              </button>
              <button 
                onClick={() => setIsRecentModalOpen(true)}
                className="btn-3d btn-3d-base02 px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
              >
                <i className="fas fa-clock mr-2 text-solar-green"></i> Recent
              </button>
              <button
                onClick={openApiKeyModal}
                className="btn-3d btn-3d-base02 px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
              >
                <i className={`fas ${isUserApiKeySet ? 'fa-check' : 'fa-key'} mr-2 text-solar-cyan`}></i> +API KEY
              </button>
              <div className="text-xs px-4 py-2 rounded-xl bg-solar-base03 text-solar-cyan font-mono shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.05)] whitespace-nowrap">
                10M+ Prompts
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(true)}
                className="btn-3d btn-3d-cyan px-6 py-2.5 rounded-xl text-sm whitespace-nowrap"
              >
                Submit Prompt
              </button>
            </div>
            
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={openApiKeyModal}
                className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-base02 text-solar-cyan"
                aria-label="+API KEY"
              >
                <i className={`fas ${isUserApiKeySet ? 'fa-check' : 'fa-key'} text-lg`}></i>
              </button>
              <button 
                 onClick={() => setIsSubmitModalOpen(true)}
                 className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-cyan text-solar-base03"
              >
                <i className="fas fa-plus text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth" ref={scrollContainerRef}>
        {/* Hero Section */}
        <div className="relative pt-16 pb-8 sm:pt-24 lg:pb-16 px-4 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-solar-base3 mb-6 drop-shadow-lg">
            Master the Art of <span className="text-solar-cyan">Prompting</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-solar-base1 mb-10 font-medium">
            Discover, share, and test over <span className="text-solar-base3 font-bold bg-solar-base02 px-3 py-1 rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.2)]">5 Million</span> high-quality prompts.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl lg:max-w-4xl mx-auto relative group px-4">
            <div className="relative flex items-center">
              <i className="fas fa-search absolute left-8 text-solar-base01 text-xl pointer-events-none"></i>
              <input 
                type="text" 
                placeholder="Search the gallery..."
                className="input-3d w-full px-14 py-5 rounded-2xl text-lg placeholder-solar-base01"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sticky Filters - Full Width - 3 Column Grid on Mobile */}
        <div className="sticky top-0 z-30 py-2 sm:py-4 bg-solar-base03/90 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.2)] mb-4 sm:mb-8 transition-all">
          <div className="w-full px-2 sm:px-6 lg:px-12">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-nowrap sm:justify-center sm:gap-3">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`btn-3d w-full sm:w-auto sm:flex-shrink-0 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs transition-all flex flex-col items-center justify-center ${
                  selectedCategory === 'All' 
                    ? 'btn-3d-cyan' 
                    : 'btn-3d-base02'
                }`}
              >
                <span className="font-bold uppercase tracking-wider mb-0.5">All</span>
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0 sm:py-0.5 rounded-md font-bold ${selectedCategory === 'All' ? 'bg-black/10' : 'bg-black/20'}`}>
                  {categoryCounts['All'] || 0}
                </span>
              </button>
              {Object.values(PromptCategory).map(cat => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn-3d w-full sm:w-auto sm:flex-shrink-0 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-solar-violet text-solar-base03 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]' 
                        : 'btn-3d-base02'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-0.5">{cat}</span>
                    <span className={`text-[8px] sm:text-[9px] px-1.5 py-0 sm:py-0.5 rounded-md font-bold ${isSelected ? 'bg-black/10' : 'bg-black/20'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Initialization Progress or Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-12 pb-12">
          {isInitializing ? (
            <div className="max-w-md mx-auto text-center py-20">
              <h2 className="text-2xl font-bold text-solar-base2 mb-2">Loading</h2>
              <p className="text-solar-base01 mb-4">Fetching prompts from database...</p>
            </div>
          ) : (
            <>
              {isLoadingPrompts ? (
                <div className="flex flex-col items-center justify-center py-32 min-h-[50vh]">
                  <div className="relative w-24 h-24 mb-8">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-solar-cyan/20 blur-xl rounded-full animate-pulse"></div>
                    
                    {/* Outer Ring */}
                    <div className="absolute inset-0 w-full h-full border-4 border-solar-base02 border-t-solar-cyan border-r-solar-cyan rounded-full animate-spin shadow-[0_0_15px_rgba(42,161,152,0.2)]"></div>
                    
                    {/* Inner Ring */}
                    <div className="absolute inset-4 border-4 border-solar-base02 border-b-solar-violet rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                    
                    {/* Center Core */}
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-3 h-3 bg-solar-base3 rounded-full shadow-[0_0_10px_#fdf6e3] animate-ping"></div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-solar-base2 tracking-[0.2em] uppercase bg-gradient-to-r from-solar-cyan to-solar-blue bg-clip-text text-transparent animate-pulse">
                      Loading Verse
                    </h3>
                    <p className="text-xs text-solar-base01 font-mono">
                      Curating intelligence...
                    </p>
                  </div>
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-20 text-solar-base01">
                  <i className="fas fa-ghost text-6xl mb-6 opacity-30 drop-shadow-md"></i>
                  <p className="text-xl">No prompts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8">
                  {prompts.map(prompt => {
                    const isLiked = !!prompt.likedByMe;
                    const copies = prompt.copies || 0;
                    const myRating = prompt.myRating || 0;
                    return (
                      <div 
                        key={prompt.id}
                        onClick={() => setSelectedPrompt(prompt)}
                        className="card-3d rounded-2xl overflow-hidden cursor-pointer flex flex-col relative"
                      >
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <span className={`tag-3d px-3 py-1 rounded-lg text-solar-base1 text-xs sm:text-sm`}>
                              {prompt.category}
                            </span>
                            <button 
                              onClick={(e) => handleToggleLike(prompt.id, e)}
                              className={`btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-base02 ${isLiked ? 'text-solar-red' : 'text-solar-base01'} z-10`}
                            >
                              <i className={`${isLiked ? 'fas' : 'far'} fa-heart text-lg`}></i>
                            </button>
                          </div>
                          <h3 className="text-xl font-bold text-solar-base3 mb-3 line-clamp-2 drop-shadow-sm">
                            {prompt.title}
                          </h3>
                          <p className="text-solar-base1 text-sm line-clamp-3 mb-4 leading-relaxed font-medium">
                            {prompt.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {prompt.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] uppercase font-bold text-solar-base01 tracking-wider">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-black/10 flex items-center justify-between backdrop-blur-sm">
                          <button 
                            onClick={(e) => handleAuthorClick(e, prompt.author)}
                            className="text-xs text-solar-base1 hover:text-solar-violet transition-colors flex items-center gap-2 z-10 font-bold truncate max-w-[50%]"
                          >
                            <div className="w-5 h-5 rounded-full bg-solar-base01 flex-shrink-0"></div> <span className="truncate">{prompt.author}</span>
                          </button>
                          
                          <div className="flex items-center gap-3">
                             {myRating > 0 && (
                               <span className="tag-3d px-2 py-0.5 rounded-md text-solar-base1 text-[10px] flex items-center gap-0.5 shadow-sm">
                                 {Array.from({ length: 5 }).map((_, i) => (
                                   <i
                                     key={i}
                                     className={`${i + 1 <= myRating ? 'fas' : 'far'} fa-star text-solar-yellow`}
                                   ></i>
                                 ))}
                               </span>
                             )}
                             {copies > 0 && (
                                <span className="tag-3d px-2 py-0.5 rounded-md text-solar-base1 text-[10px] flex items-center gap-1 shadow-sm">
                                   <i className="fas fa-copy text-solar-cyan"></i> {copies}
                                </span>
                             )}
                             <span className="text-xs text-solar-cyan font-bold flex items-center">
                               <i className="fas fa-heart text-solar-red mr-1"></i> {prompt.likes}
                             </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {!isLoadingPrompts && prompts.length > 0 && (
                <div className="mt-16 flex justify-center items-center gap-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-3d btn-3d-base02 w-14 h-14 flex items-center justify-center rounded-full"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  <div className="text-2xl font-black text-solar-base2 px-8 py-4 bg-solar-base02 rounded-2xl shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.05)]">
                    {currentPage}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore && prompts.length < ITEMS_PER_PAGE}
                     className="btn-3d btn-3d-base02 w-14 h-14 flex items-center justify-center rounded-full"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer - Fixed at Bottom */}
      <footer className="flex-none h-[40px] bg-solar-base02 flex items-center justify-between px-8 lg:px-16 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] w-full relative z-40 border-t border-solar-base03">
        
        {/* Left: Text Info */}
        <div className="text-left flex flex-col justify-center">
          <p 
            className="font-black text-lg text-solar-base3 tracking-widest uppercase leading-none"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.1)" }}
          >
            PromptVerse
          </p>
          <p 
            className="font-medium text-solar-base1 text-[10px] tracking-wide opacity-80"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
          >
            &copy; {new Date().getFullYear()} Built for the AI Era.
          </p>
        </div>
        
        {/* Right: 3D Icons */}
        <div className="flex gap-4">
          {/* Website */}
          <a 
            href="https://alienshanu.me"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-3d w-8 h-8 flex items-center justify-center text-solar-base1 hover:text-solar-cyan text-sm bg-solar-base02 transition-transform transform hover:-translate-y-1"
            aria-label="Website"
          >
              <i className="fas fa-globe drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)]"></i>
          </a>

          {/* GitHub */}
          <a 
            href="https://github.com/Alien-Shanu/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-3d w-8 h-8 flex items-center justify-center text-solar-base1 hover:text-solar-base3 text-sm bg-solar-base02 transition-transform transform hover:-translate-y-1"
            aria-label="GitHub"
          >
              <i className="fab fa-github drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)]"></i>
          </a>

          {/* Twitter */}
          <a 
            href="https://x.com/Alien_Shanu/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-3d w-8 h-8 flex items-center justify-center text-solar-base1 hover:text-solar-blue text-sm bg-solar-base02 transition-transform transform hover:-translate-y-1"
            aria-label="Twitter"
          >
              <i className="fab fa-twitter drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)]"></i>
          </a>

          {/* Discord */}
          <a 
            href="https://discord.com/users/612080689978015752"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-3d w-8 h-8 flex items-center justify-center text-solar-base1 hover:text-solar-violet text-sm bg-solar-base02 transition-transform transform hover:-translate-y-1"
            aria-label="Discord"
          >
              <i className="fab fa-discord drop-shadow-[2px_2px_2px_rgba(0,0,0,0.5)]"></i>
          </a>
        </div>
      </footer>

      {/* Scroll to Top Button with Percentage Ring - Position Adjusted for Fixed Footer */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-[60px] right-8 z-40 w-16 h-16 rounded-full btn-3d btn-3d-base02 flex items-center justify-center transition-all duration-300 group shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
         <svg className="absolute w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#002b36"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#2aa198"
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * scrollProgress) / 100}
              strokeLinecap="round"
              className="transition-all duration-100 ease-out"
            />
         </svg>
         <span className="text-[10px] font-black text-solar-cyan group-hover:hidden">{scrollProgress}%</span>
         <i className="fas fa-arrow-up text-lg text-solar-cyan hidden group-hover:block animate-bounce"></i>
      </button>

      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-solar-base03/90 backdrop-blur-sm"
            onClick={closeApiKeyModal}
          />
          <div className="relative w-full max-w-md modal-3d rounded-2xl p-6 bg-solar-base02">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-solar-base3">Add Gemini API Key</h3>
              <button
                onClick={closeApiKeyModal}
                className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-red text-solar-base3"
                disabled={isSavingApiKey}
                aria-label="Close"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveApiKey();
              }}
              className="input-3d w-full p-4 rounded-xl mb-3"
              placeholder="AIzaSy..."
              autoComplete="off"
              autoFocus
              disabled={isSavingApiKey}
            />

            {apiKeyError && (
              <div className="text-xs font-bold text-solar-red mb-4">{apiKeyError}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={saveApiKey}
                disabled={isSavingApiKey}
                className="btn-3d btn-3d-cyan flex-1 py-3.5 rounded-xl text-sm"
              >
                {isSavingApiKey ? 'Saving...' : 'Save Key'}
              </button>
              {isUserApiKeySet && (
                <button
                  onClick={() => {
                    clearApiKey();
                    closeApiKeyModal();
                  }}
                  disabled={isSavingApiKey}
                  className="btn-3d btn-3d-base02 px-6 py-3.5 rounded-xl text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptModal 
          prompt={selectedPrompt} 
          onClose={() => setSelectedPrompt(null)} 
          onUpdate={handleUpdatePrompt}
          onCopy={handleCopyIncrement}
        />
      )}

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <SubmitPromptModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleAddPrompt}
        />
      )}

      {/* Recent Prompts Modal */}
      {isRecentModalOpen && (
        <RecentPromptsModal
          onClose={() => setIsRecentModalOpen(false)}
          onPromptClick={(p) => {
             setIsRecentModalOpen(false);
             setTimeout(() => setSelectedPrompt(p), 50);
          }}
        />
      )}

      {/* Popular Prompts Modal */}
      {isPopularModalOpen && (
        <PopularPromptsModal
          onClose={() => setIsPopularModalOpen(false)}
          onPromptClick={(p) => {
             setIsPopularModalOpen(false);
             setTimeout(() => setSelectedPrompt(p), 50);
          }}
        />
      )}

      {/* Author Profile Modal */}
      {selectedAuthor && (
        <AuthorProfileModal
          authorName={selectedAuthor}
          allPrompts={prompts} 
          onClose={() => setSelectedAuthor(null)}
          onPromptClick={(p) => {
            setSelectedAuthor(null);
            setTimeout(() => setSelectedPrompt(p), 50);
          }}
        />
      )}
    </div>
  );
}

export default App;
