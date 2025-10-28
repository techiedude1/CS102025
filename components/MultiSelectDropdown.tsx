import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange, placeholder = "Select...", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getButtonLabel = () => {
    if (selected.length === 0) {
      return placeholder;
    }
    if (selected.length === 1) {
      const option = options.find(opt => opt.value === selected[0]);
      return option ? option.label : '1 selected';
    }
    return `${selected.length} drugs selected`;
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-left shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{getButtonLabel()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-100 text-slate-900"
              role="option"
              aria-selected={selected.includes(option.value)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  readOnly
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  tabIndex={-1}
                />
                <span className={`ml-3 block truncate ${selected.includes(option.value) ? 'font-semibold' : 'font-normal'}`}>
                  {option.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
