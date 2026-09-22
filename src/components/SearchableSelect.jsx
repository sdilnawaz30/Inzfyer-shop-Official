import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, id }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    // Sync external value changes
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // If they clicked away without selecting a valid option, reset to the last valid value
        if (inputValue !== value) {
          setInputValue(value || '');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputValue, value]);

  const handleSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    // If they type, the locked value is cleared until they select again
    // Unless they type the exact valid string, then we can auto-select it.
    const exactMatch = options.find(opt => opt.toLowerCase() === e.target.value.toLowerCase());
    if (exactMatch) {
      onChange(exactMatch);
    } else {
      onChange('');
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="searchable-select-input"
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          zIndex: 1000,
          padding: 0,
          margin: 0,
          listStyle: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                background: inputValue === opt ? '#fce7f3' : 'transparent',
                color: '#1f2937'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fdf2f8'}
              onMouseLeave={(e) => e.currentTarget.style.background = inputValue === opt ? '#fce7f3' : 'transparent'}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
