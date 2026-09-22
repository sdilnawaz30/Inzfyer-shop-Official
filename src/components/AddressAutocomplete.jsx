import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ value, onChange, placeholder, id }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (inputValue && inputValue.length > 2 && isOpen && inputValue !== value) {
        setIsFetching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&addressdetails=1&countrycodes=IN&limit=5`, {
            headers: {
              'User-Agent': 'InzfyerShop/1.0'
            }
          });
          const data = await res.json();
          setSuggestions(data.map(item => item.display_name));
        } catch (error) {
          console.error("Nominatim fetch error:", error);
        } finally {
          setIsFetching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 600); // 600ms debounce to respect Nominatim API limits

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, isOpen, value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        onChange(inputValue); // Lock in whatever they typed even if not selected (since it's optional)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, onChange]);

  const handleSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    onChange(e.target.value);
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
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      {isOpen && (suggestions.length > 0 || isFetching) && (
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
          {isFetching ? (
            <li style={{ padding: '0.5rem 0.75rem', color: '#6b7280', fontSize: '0.9rem' }}>Searching...</li>
          ) : (
            suggestions.map((opt, i) => (
              <li
                key={i}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  color: '#1f2937',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fdf2f8'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
