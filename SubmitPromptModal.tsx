import React, { useState } from 'react';
import { Prompt, PromptCategory } from './types';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Math.max(0, parseInt(value) || 0) : value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleCategorySelect = (category: PromptCategory) => {
    setFormData({ ...formData, category });
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
      likes: Number(formData.likes),
      modelSuggestion,
      createdAt: Date.now()
    };

    onSubmit(newPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#111] border border-glass-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue border border-neon-blue/30">
              <i className="fas fa-pen-nib text-sm"></i>
            </div>
            <h2 className="text-xl font-bold text-white">Submit a Prompt</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center animate-pulse">
                <i className="fas fa-exclamation-circle mr-3 text-lg"></i>
                {error}
              </div>
            )}

            {/* Basic Info Group */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-white/5 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Title <span className="text-neon-blue">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. React Component Generator"
                    className="w-full bg-[#151515] text-white p-3 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all placeholder-gray-700"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Author <span className="text-neon-blue">*</span></label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Your Name or Alias"
                    className="w-full bg-[#151515] text-white p-3 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all placeholder-gray-700"
                  />
                </div>

                {/* Likes (Optional) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Initial Likes</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="likes"
                      min="0"
                      value={formData.likes}
                      onChange={handleChange}
                      className="w-full bg-[#151515] text-white p-3 pl-10 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <i className="fas fa-heart text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification Group */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-white/5 pb-2">
                Classification
              </h3>
              
              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PromptCategory).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        formData.category === cat
                          ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                          : 'bg-[#151515] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. React, Coding, Frontend (comma separated)"
                  className="w-full bg-[#151515] text-white p-3 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all placeholder-gray-700"
                />
              </div>
            </div>

            {/* Content Group */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-white/5 pb-2">
                Content
              </h3>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Short Description <span className="text-neon-blue">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe what this prompt does..."
                  rows={2}
                  className="w-full bg-[#151515] text-white p-3 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all resize-none placeholder-gray-700"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Prompt Content <span className="text-neon-blue">*</span></label>
                <div className="relative">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Paste the full prompt here..."
                    rows={8}
                    className="w-full bg-[#151515] text-white p-4 rounded-lg border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all font-mono text-sm leading-relaxed placeholder-gray-700"
                  />
                  <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono pointer-events-none">
                    Markdown supported
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#0a0a0a] pb-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors font-medium border border-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-neon-blue to-blue-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Submit Prompt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitPromptModal;
