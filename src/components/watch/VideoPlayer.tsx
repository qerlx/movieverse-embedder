import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isValidVideoSource } from '@/utils/video';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  isLoading: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  isLoading,
  onLoad,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!videoUrl) return;

    if (!isValidVideoSource(videoUrl)) {
      console.error('Invalid video source URL:', videoUrl);
      onError?.();
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      onLoad?.();
    };

    const handleError = () => {
      console.error('Failed to load video player');
      onError?.();
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [videoUrl, onLoad, onError]);

  if (!videoUrl) return null;

  return (
    <motion.div
      className="relative w-full h-screen bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <iframe
        ref={iframeRef}
        src={videoUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="origin"
        loading="eager"
        aria-label={`Video player for ${title}`}
      />
    </motion.div>
  );
};
