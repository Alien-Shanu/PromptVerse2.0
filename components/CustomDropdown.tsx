import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-3d w-full p-4 rounded-xl flex items-center justify-between text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-solar-cyan"
      >
        <span className="truncate pr-4 text-solar-base2 font-medium">
          {selectedOption?.label || 'Select...'}
        </span>
        <i className={`fas fa-chevron-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-solar-base01`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-solar-base02 border border-solar-base01/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto overflow-x-hidden animate-fade-in custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full p-3 text-left hover:bg-solar-base03 transition-colors flex items-center justify-between border-b border-solar-base01/10 last:border-0 ${
                opt.value === value ? 'text-solar-cyan font-bold bg-solar-base03/50' : 'text-solar-base1'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <i className="fas fa-check text-xs"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;