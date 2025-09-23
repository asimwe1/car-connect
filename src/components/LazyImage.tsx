import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  fallbackSrc = '/placeholder.svg',
  className = '',
  containerClassName = '',
  ...imgProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const effectiveSrc = !error && src ? src : fallbackSrc;

  return (
    <div className={`relative overflow-hidden bg-muted ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <img
        src={effectiveSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`block w-full h-full object-cover transition-transform duration-300 ${loaded ? '' : 'opacity-0'} ${className}`}
        {...imgProps}
      />
    </div>
  );
};

export default LazyImage;
