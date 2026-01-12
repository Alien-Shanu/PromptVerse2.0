import React, { useEffect, useState } from 'react';
import { Prompt, PromptCategory } from '../types';
import CustomDropdown from './CustomDropdown';
import { getAdminStatus, unlockInitialLikes } from '../services/db';

interface SubmitPromptModalProps {
  onClose: () => void;
  onSubmit: (prompt: Prompt) => void;
}

const SubmitPromptModal: React.FC<SubmitPromptModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: PromptCategory.CODING,
    tags: '',
    author: '',
    likes: 0
  });
  const [error, setError] = useState('');
  const [isLikesUnlocked, setIsLikesUnlocked] = useState(false);
  const [isUnlockingLikes, setIsUnlockingLikes] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenModalError, setTokenModalError] = useState('');

  useEffect(() => {
    let mounted = true;
    getAdminStatus()
      .then((s) => {
        if (!mounted) return;
        setIsLikesUnlocked(!!s.unlocked);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenUnlockLikes = () => {
    if (isLikesUnlocked || isUnlockingLikes) return;
    setTokenInput('');
    setTokenModalError('');
    setIsTokenModalOpen(true);
  };

  const handleCloseTokenModal = () => {
    if (isUnlockingLikes) return;
    setIsTokenModalOpen(false);
    setTokenModalError('');
  };

  const handleConfirmUnlockLikes = async () => {
    if (isLikesUnlocked || isUnlockingLikes) return;
    const token = tokenInput.trim();
    if (!token) {
      setTokenModalError('Token is required.');
      return;
    }

    setIsUnlockingLikes(true);
    try {
      const res = await unlockInitialLikes(token);
      if (res.unlocked) {
        setIsLikesUnlocked(true);
        setIsTokenModalOpen(false);
        setTokenModalError('');
        return;
      }
    } catch {
      setTokenModalError('Invalid access token.');
    } finally {
      setIsUnlockingLikes(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Math.max(0, parseInt(value) || 0) : value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value as PromptCategory });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.title.trim()) { setError('Title is required.'); return; }
    if (!formData.author.trim()) { setError('Author name is required.'); return; }
    if (!formData.description.trim()) { setError('Description is required.'); return; }
    if (!formData.content.trim()) { setError('Prompt content is required.'); return; }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    
    // Auto-select model based on category logic
    let modelSuggestion = 'gemini-3-flash-preview';
    if (formData.category === PromptCategory.IMAGE || formData.category === PromptCategory.GEN_3D || formData.category === PromptCategory.CARTOON) {
      modelSuggestion = 'gemini-2.5-flash-image';
    } else if (formData.category === PromptCategory.VIDEO) {
      modelSuggestion = 'veo-3.1-fast-generate-preview';
    } else if (formData.category === PromptCategory.WRITING || formData.category === PromptCategory.BUSINESS) {
      modelSuggestion = 'gemini-3-pro-preview';
    }

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content, // Preserve whitespace in content
      category: formData.category,
      tags: tagsArray.length > 0 ? tagsArray : ['Community'],
      author: formData.author.trim(),
      likes: isLikesUnlocked ? Number(formData.likes) : 0,
      modelSuggestion,
      createdAt: Date.now()
    };

    onSubmit(newPrompt);
    onClose();
  };

  const categoryOptions = Object.values(PromptCategory).map(cat => ({
    value: cat,
    label: cat
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-solar-base03/90 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (isTokenModalOpen) {
            handleCloseTokenModal();
          } else {
            onClose();
          }
        }}
      />

      {isTokenModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-solar-base03/80 backdrop-blur-sm"
            onClick={handleCloseTokenModal}
          />
          <div className="relative w-full max-w-md modal-3d rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 bg-solar-base02 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-solar-cyan flex items-center justify-center text-solar-base03 font-bold">
                  <i className="fas fa-lock text-sm"></i>
                </div>
                <h3 className="text-lg font-black text-solar-base3 uppercase">Access Token</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseTokenModal}
                className="btn-icon-3d w-9 h-9 flex items-center justify-center bg-solar-red text-solar-base3"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            <div className="p-6 bg-solar-base03">
              {tokenModalError && (
                <div className="card-3d bg-solar-red/10 p-3 rounded-xl text-solar-red font-bold flex items-center shadow-none mb-4">
                  <i className="fas fa-exclamation-circle mr-3 text-lg"></i>
                  {tokenModalError}
                </div>
              )}

              <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">
                Token
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  if (tokenModalError) setTokenModalError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmUnlockLikes();
                  }
                }}
                className="input-3d w-full p-4 rounded-xl placeholder-solar-base01"
                placeholder="Enter token"
                autoFocus
              />

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseTokenModal}
                  className="btn-3d btn-3d-base02 px-6 py-3 rounded-xl"
                  disabled={isUnlockingLikes}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnlockLikes}
                  className="btn-3d btn-3d-cyan px-7 py-3 rounded-xl flex items-center"
                  disabled={isUnlockingLikes}
                >
                  <i className="fas fa-unlock mr-2"></i>
                  {isUnlockingLikes ? 'Unlocking...' : 'Unlock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Modal Content */}
      <div className="relative w-full max-w-2xl modal-3d rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-solar-base02 shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-solar-cyan flex items-center justify-center text-solar-base03 font-bold shadow-[2px_2px_5px_rgba(0,0,0,0.2)]">
              <i className="fas fa-pen-nib text-lg"></i>
            </div>
            <h2 className="text-2xl font-black text-solar-base3 uppercase drop-shadow-sm">Submit a Prompt</h2>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon-3d w-10 h-10 flex items-center justify-center bg-solar-red text-solar-base3"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-solar-base03">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="card-3d bg-solar-red/10 p-4 rounded-xl text-solar-red font-bold flex items-center shadow-none">
                <i className="fas fa-exclamation-circle mr-3 text-xl"></i>
                {error}
              </div>
            )}

            {/* Basic Info Group */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-wider text-solar-base01 font-black pb-2 border-b border-solar-base01/10">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Title <span className="text-solar-cyan">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. React Component Generator"
                    className="input-3d w-full p-4 rounded-xl placeholder-solar-base01"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Author <span className="text-solar-cyan">*</span></label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Your Name or Alias"
                    className="input-3d w-full p-4 rounded-xl placeholder-solar-base01"
                  />
                </div>

                {/* Likes (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Initial Likes</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="likes"
                      min="0"
                      value={formData.likes}
                      onChange={handleChange}
                      disabled={!isLikesUnlocked}
                      className="input-3d w-full p-4 pl-12 rounded-xl"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-solar-base01">
                      <button
                        type="button"
                        onClick={handleOpenUnlockLikes}
                        className="text-solar-base01"
                        aria-label="Unlock Initial Likes"
                      >
                        <i className={`fas ${isLikesUnlocked ? 'fa-heart' : 'fa-lock'} text-sm`}></i>
                      </button>
                    </div>
                  </div>
                  {!isLikesUnlocked && (
                    <button
                      type="button"
                      onClick={handleOpenUnlockLikes}
                      disabled={isUnlockingLikes}
                      className="mt-2 text-[11px] font-bold text-solar-base01 hover:text-solar-cyan transition-colors"
                    >
                      {isUnlockingLikes ? 'Unlocking...' : 'Unlock Initial Likes with token'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Classification Group */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-wider text-solar-base01 font-black pb-2 border-b border-solar-base01/10">
                Classification
              </h3>
              
              {/* Category */}
              <div>
                <CustomDropdown 
                  label="Category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleCategoryChange}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. React, Coding, Frontend"
                  className="input-3d w-full p-4 rounded-xl placeholder-solar-base01"
                />
              </div>
            </div>

            {/* Content Group */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-wider text-solar-base01 font-black pb-2 border-b border-solar-base01/10">
                Content
              </h3>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Short Description <span className="text-solar-cyan">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe what this prompt does..."
                  rows={2}
                  className="input-3d w-full p-4 rounded-xl resize-none placeholder-solar-base01"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Prompt Content <span className="text-solar-cyan">*</span></label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Paste the full prompt here..."
                  rows={8}
                  className="input-3d w-full p-5 rounded-xl font-mono text-sm leading-relaxed placeholder-solar-base01 whitespace-pre-wrap break-words"
                />
              </div>
            </div>
            
            <div className="pt-8 mt-4 border-t border-solar-base01/10 flex justify-end gap-6 sticky bottom-0 bg-solar-base03 pb-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-3d btn-3d-base02 px-8 py-3.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-3d btn-3d-cyan px-10 py-3.5 rounded-xl flex items-center"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitPromptModal;
