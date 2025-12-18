import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTVShowSeasonDetails } from '@/lib/api';
import { toast } from 'sonner';

interface AutoAdvanceConfig {
  showId: number | string;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons?: number;
  enabled?: boolean;
  delaySeconds?: number;
}

interface Episode {
  episode_number: number;
  name: string;
  id: number;
}

export function useAutoAdvance(config: AutoAdvanceConfig | null) {
  const navigate = useNavigate();
  const [nextEpisode, setNextEpisode] = useState<{
    season: number;
    episode: number;
    name?: string;
  } | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef<NodeJS.Timeout>();
  const advanceTimerRef = useRef<NodeJS.Timeout>();

  // Fetch next episode info
  useEffect(() => {
    if (!config) return;
    
    const fetchNextEpisode = async () => {
      try {
        const seasonDetails = await getTVShowSeasonDetails(
          Number(config.showId), 
          config.currentSeason
        );
        
        if (seasonDetails?.success && seasonDetails.episodes) {
          const episodes = seasonDetails.episodes as Episode[];
          const currentEpIndex = episodes.findIndex(
            (ep) => ep.episode_number === config.currentEpisode
          );
          
          // Check if there's a next episode in current season
          if (currentEpIndex !== -1 && currentEpIndex < episodes.length - 1) {
            const nextEp = episodes[currentEpIndex + 1];
            setNextEpisode({
              season: config.currentSeason,
              episode: nextEp.episode_number,
              name: nextEp.name
            });
          } else if (config.totalSeasons && config.currentSeason < config.totalSeasons) {
            // Check next season
            const nextSeasonDetails = await getTVShowSeasonDetails(
              Number(config.showId), 
              config.currentSeason + 1
            );
            
            if (nextSeasonDetails?.success && nextSeasonDetails.episodes?.length > 0) {
              const firstEp = nextSeasonDetails.episodes[0] as Episode;
              setNextEpisode({
                season: config.currentSeason + 1,
                episode: firstEp.episode_number,
                name: firstEp.name
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch next episode:', error);
      }
    };

    fetchNextEpisode();
  }, [config?.showId, config?.currentSeason, config?.currentEpisode, config?.totalSeasons]);

  // Handle playback end (auto-advance trigger)
  const triggerAutoAdvance = useCallback(() => {
    if (!nextEpisode || !config?.enabled) return;
    
    setShowCountdown(true);
    setCountdown(config.delaySeconds || 10);

    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto advance after delay
    advanceTimerRef.current = setTimeout(() => {
      navigateToNext();
    }, (config.delaySeconds || 10) * 1000);
  }, [nextEpisode, config]);

  const navigateToNext = useCallback(() => {
    if (!nextEpisode || !config) return;
    
    // Clear timers
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    
    setShowCountdown(false);
    navigate(`/watch/tv/${config.showId}/${nextEpisode.season}/${nextEpisode.episode}`);
    
    toast.success(`Playing S${nextEpisode.season} E${nextEpisode.episode}`, {
      description: nextEpisode.name
    });
  }, [nextEpisode, config, navigate]);

  const cancelAutoAdvance = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setShowCountdown(false);
  }, []);

  const skipToNext = useCallback(() => {
    cancelAutoAdvance();
    navigateToNext();
  }, [cancelAutoAdvance, navigateToNext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  return {
    nextEpisode,
    showCountdown,
    countdown,
    triggerAutoAdvance,
    cancelAutoAdvance,
    skipToNext,
    hasNextEpisode: !!nextEpisode
  };
}
