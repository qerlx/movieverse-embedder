import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MiniPlayerState {
  isVisible: boolean;
  videoUrl: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv' | 'anime';
  mediaId: string | number;
  season?: number;
  episode?: number;
}

interface MiniPlayerContextType {
  miniPlayer: MiniPlayerState | null;
  showMiniPlayer: (data: Omit<MiniPlayerState, 'isVisible'>) => void;
  hideMiniPlayer: () => void;
  isMiniPlayerVisible: boolean;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export const MiniPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [miniPlayer, setMiniPlayer] = useState<MiniPlayerState | null>(null);

  const showMiniPlayer = useCallback((data: Omit<MiniPlayerState, 'isVisible'>) => {
    setMiniPlayer({ ...data, isVisible: true });
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setMiniPlayer(null);
  }, []);

  return (
    <MiniPlayerContext.Provider
      value={{
        miniPlayer,
        showMiniPlayer,
        hideMiniPlayer,
        isMiniPlayerVisible: miniPlayer?.isVisible ?? false
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
};

export const useMiniPlayer = () => {
  const context = useContext(MiniPlayerContext);
  if (context === undefined) {
    throw new Error('useMiniPlayer must be used within a MiniPlayerProvider');
  }
  return context;
};
