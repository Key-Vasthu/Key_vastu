import React, { useState } from 'react';
import { getR2AssetUrl, getR2AssetUrlRoot } from '../../utils/r2';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  preferRoot?: boolean;
}

/**
 * Smart Image component that tries multiple image sources
 * Tries: R2 images folder -> R2 root -> local fallback
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fallbackSrc,
  preferRoot = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(() => {
    // Try R2 images folder first (or root if preferRoot is true)
    return preferRoot ? getR2AssetUrlRoot(src) : getR2AssetUrl(src);
  });
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try root level if we tried images folder
      if (!preferRoot) {
        setImageSrc(getR2AssetUrlRoot(src));
      } else {
        // Try images folder if we tried root
        setImageSrc(getR2AssetUrl(src));
      }
    } else {
      // Both R2 locations failed, try local fallback
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      } else {
        setImageSrc(`/${src}`);
      }
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
};
