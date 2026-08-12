import React, { useState } from 'react';

const ResponsiveImage = ({ 
  src, 
  alt = '', 
  className = '', 
  style = {}, 
  priority = false,
  onClick,
  ...props 
}) => {
  const [error, setError] = useState(false);

  // Derive thumbnail URL if it's a webp image and no error has occurred yet
  let thumbSrc = null;
  if (src && src.endsWith('.webp') && !error) {
    thumbSrc = src.replace('.webp', '-thumb.webp');
  }

  // Handle fallback if thumbnail doesn't exist
  const handleError = () => {
    if (thumbSrc) {
      setError(true); // Fallback to normal src without srcset
    }
  };

  const hasSrcSet = thumbSrc && !error;

  return (
    <img
      src={src}
      srcSet={hasSrcSet ? `${thumbSrc} 400w, ${src} 1000w` : undefined}
      sizes={hasSrcSet ? "(max-width: 600px) 400px, 100vw" : undefined}
      loading={priority ? undefined : "lazy"}
      fetchpriority={priority ? "high" : "auto"}
      className={className}
      style={{
        aspectRatio: '1 / 1', // Default to square, overridden by style prop if passed
        objectFit: 'cover',
        backgroundColor: '#f9fafb', // Light gray background while loading
        ...style
      }}
      alt={alt}
      onClick={onClick}
      onError={handleError}
      {...props}
    />
  );
};

export default ResponsiveImage;
