import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage-service';
import { addToWatchHistory } from '@/lib/firebase-watch';
import { STORAGE_KEYS } from '@/constants';
import { videoSources, getVideoSource, buildVideoUrl } from '@/utils/video';
import { validateMediaId, validateSeasonEpisode, sanitizeText } from '@/utils/api';

interface WatchPageState {
  title: string;
  isLoading: boolean;
  error: string | null;
  videoUrl: string;
  currentSource: typeof videoSources[0];
  posterPath?: string;
  genres?: number[];
}

export const useWatchPage = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [state, setState] = useState<WatchPageState>({
    title: '',
    isLoading: true,
    error: null,
    videoUrl: '',
    currentSource: videoSources[0],
  });
  
  const [showData, setShowData] = useState<any>(null);
  const [animeDub, setAnimeDub] = useState(false);

  // Validate parameters
  const validatedParams = useMemo(() => {
    if (!type || !id) return null;
    
    if (type === 'anime') {
      if (!episode) return null;
      const epNum = parseInt(episode, 10);
      if (!epNum || epNum < 1) return null;
      return { type: 'anime', id, episode: epNum } as const;
    }

    const mediaId = validateMediaId(id);
    if (!mediaId) return null;
    
    if (type === 'tv') {
      if (!season || !episode) return null;
      const validatedEpisode = validateSeasonEpisode(season, episode);
      if (!validatedEpisode) return null;
      
      return {
        type,
        id: mediaId,
        season: validatedEpisode.season,
        episode: validatedEpisode.episode,
      };
    }
    
    if (type === 'movie') {
      return { type, id: mediaId };
    }
    
    return null;
  }, [type, id, season, episode]);

  // Switch video source
  const switchVideoSource = useCallback((sourceId: string) => {
    if (!validatedParams) return;
    
    let newSource = getVideoSource(sourceId);

    if (validatedParams.type === 'anime' && !newSource.supportsAnime) {
      const fallbackAnime = videoSources.find(src => src.supportsAnime);
      if (!fallbackAnime) {
        toast.error('No anime-compatible source available');
        return;
      }
      newSource = fallbackAnime;
    }

    const seasonArg = validatedParams.type === 'tv' ? validatedParams.season?.toString() : undefined;
    const episodeArg = validatedParams.type === 'tv'
      ? validatedParams.episode?.toString()
      : validatedParams.type === 'anime'
        ? validatedParams.episode?.toString()
        : undefined;

    const extraParams = validatedParams.type === 'anime'
      ? { dub: animeDub, autoPlay: true, autoSkipIntro: true }
      : {};

    const newUrl = buildVideoUrl(
      newSource,
      validatedParams.type,
      validatedParams.id.toString(),
      seasonArg,
      episodeArg,
      extraParams
    );

    if (!newUrl) {
      toast.error('Failed to build video URL for this source');
      return;
    }

    setState(prev => ({ ...prev, currentSource: newSource, videoUrl: newUrl, isLoading: true }));
    
    const savedKey = validatedParams.type === 'tv' 
      ? `${STORAGE_KEYS.VIDEO_SOURCE}_${validatedParams.type}_${validatedParams.id}_${validatedParams.season}_${validatedParams.episode}`
      : validatedParams.type === 'anime'
        ? `${STORAGE_KEYS.VIDEO_SOURCE}_${validatedParams.type}_${validatedParams.id}_${validatedParams.episode}`
        : `${STORAGE_KEYS.VIDEO_SOURCE}_${validatedParams.type}_${validatedParams.id}`;
    
    storageService.setItem(savedKey, sourceId);
    toast.success(`Switched to ${newSource.name}`);
  }, [validatedParams, animeDub]);

  // Fetch media details
  const fetchMediaDetails = useCallback(async () => {
    if (!validatedParams) {
      setState(prev => ({ ...prev, error: 'Invalid parameters', isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (validatedParams.type === 'anime') {
        const animeTitle = `Anime: ${validatedParams.id} Episode ${validatedParams.episode}`;
        
        const savedSourceKey = `${STORAGE_KEYS.VIDEO_SOURCE}_anime_${validatedParams.id}_${validatedParams.episode}`;
        let savedSourceId = storageService.getItem<string>(savedSourceKey);
        
        let source = savedSourceId ? getVideoSource(savedSourceId) : getVideoSource();
        
        if (!source.supportsAnime) {
          const animeSource = videoSources.find(s => s.supportsAnime);
          if (animeSource) {
            source = animeSource;
            storageService.setItem(savedSourceKey, source.id);
          }
        }

        const url = buildVideoUrl(
          source,
          'anime',
          validatedParams.id.toString(),
          undefined,
          validatedParams.episode.toString(),
          { dub: animeDub, autoPlay: true, autoSkipIntro: true }
        );

        if (!url) {
          throw new Error('Failed to generate anime video URL');
        }

        setState({
          title: animeTitle,
          isLoading: false,
          error: null,
          videoUrl: url,
          currentSource: source,
        });
        return;
      }

      if (validatedParams.type === 'movie') {
        const details = await getMovieDetails(validatedParams.id);
        if (!details) throw new Error('Failed to fetch movie details');

        const savedSourceKey = `${STORAGE_KEYS.VIDEO_SOURCE}_movie_${validatedParams.id}`;
        const savedSourceId = storageService.getItem<string>(savedSourceKey);
        const source = savedSourceId ? getVideoSource(savedSourceId) : getVideoSource();

        const url = buildVideoUrl(source, 'movie', validatedParams.id.toString());
        if (!url) throw new Error('Failed to generate video URL');

        setState({
          title: sanitizeText(details.title),
          isLoading: false,
          error: null,
          videoUrl: url,
          currentSource: source,
          posterPath: details.poster_path || undefined,
          genres: details.genre_ids || details.genres?.map(g => g.id),
        });

        if (currentUser) {
          await addToWatchHistory(currentUser, {
            mediaId: validatedParams.id.toString(),
            mediaType: 'movie',
            title: details.title,
            posterPath: details.poster_path,
            progress: 0,
            genres: details.genre_ids || details.genres?.map(g => g.id),
          });
        }
      } else if (validatedParams.type === 'tv') {
        const [showDetails, seasonDetails] = await Promise.all([
          getTVShowDetails(validatedParams.id),
          getTVShowSeasonDetails(validatedParams.id, validatedParams.season),
        ]);

        if (!showDetails) throw new Error('Failed to fetch TV show details');
        if (!seasonDetails) throw new Error('Failed to fetch season details');

        const episodeData = seasonDetails.episodes?.find(
          (ep: any) => ep.episode_number === validatedParams.episode
        );

        const title = episodeData?.name 
          ? `${sanitizeText(showDetails.name)} - S${validatedParams.season}E${validatedParams.episode}: ${sanitizeText(episodeData.name)}`
          : `${sanitizeText(showDetails.name)} - S${validatedParams.season}E${validatedParams.episode}`;

        const savedSourceKey = `${STORAGE_KEYS.VIDEO_SOURCE}_tv_${validatedParams.id}_${validatedParams.season}_${validatedParams.episode}`;
        const savedSourceId = storageService.getItem<string>(savedSourceKey);
        const source = savedSourceId ? getVideoSource(savedSourceId) : getVideoSource();

        const url = buildVideoUrl(
          source,
          'tv',
          validatedParams.id.toString(),
          validatedParams.season.toString(),
          validatedParams.episode.toString()
        );

        if (!url) throw new Error('Failed to generate video URL');

        setState({
          title,
          isLoading: false,
          error: null,
          videoUrl: url,
          currentSource: source,
          posterPath: showDetails.poster_path || undefined,
          genres: showDetails.genre_ids || showDetails.genres?.map(g => g.id),
        });

        setShowData(showDetails);

        if (currentUser) {
          await addToWatchHistory(currentUser, {
            mediaId: validatedParams.id.toString(),
            mediaType: 'tv',
            title: showDetails.name,
            posterPath: showDetails.poster_path,
            progress: 0,
            lastEpisode: {
              season: validatedParams.season,
              episode: validatedParams.episode,
              name: episodeData?.name || '',
            },
            genres: showDetails.genre_ids || showDetails.genres?.map(g => g.id),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching media details:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load media details',
        isLoading: false,
      }));
      toast.error('Failed to load media details');
    }
  }, [validatedParams, currentUser, animeDub]);

  // Fetch on mount and param changes
  useEffect(() => {
    fetchMediaDetails();
  }, [fetchMediaDetails]);

  return {
    state,
    validatedParams,
    showData,
    animeDub,
    setAnimeDub,
    switchVideoSource,
    navigate,
  };
};
