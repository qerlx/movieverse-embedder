import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTVShowSeasonDetails } from "@/lib/api";

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  overview: string;
  air_date: string;
  runtime: number | null;
  vote_average: number;
}

interface InPlayerEpisodeSelectorProps {
  showId: number;
  currentSeason: number;
  currentEpisode: number;
  showTitle: string;
  onEpisodeSelect: (season: number, episode: number) => void;
}

const InPlayerEpisodeSelector: React.FC<InPlayerEpisodeSelectorProps> = ({
  showId,
  currentSeason,
  currentEpisode,
  showTitle,
  onEpisodeSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [seasons, setSeasons] = useState<number[]>([]);

  useEffect(() => {
    // Fetch basic show info to get available seasons
    const fetchShowInfo = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${showId}?language=en-US`,
          {
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const validSeasons = data.seasons
            ?.filter((s: any) => s.season_number > 0)
            .map((s: any) => s.season_number) || [];
          setSeasons(validSeasons);
        }
      } catch (error) {
        console.error('Error fetching show info:', error);
      }
    };

    fetchShowInfo();
  }, [showId]);

  useEffect(() => {
    if (isOpen && currentSeason) {
      fetchCurrentSeasonEpisodes();
    }
  }, [isOpen, currentSeason]);

  const fetchCurrentSeasonEpisodes = async () => {
    setIsLoading(true);
    try {
      const seasonData = await getTVShowSeasonDetails(showId, currentSeason);
      if (seasonData?.success && seasonData.episodes) {
        setEpisodes(seasonData.episodes);
      }
    } catch (error) {
      console.error('Error fetching season episodes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEpisodeSelect = (episodeNumber: number) => {
    onEpisodeSelect(currentSeason, episodeNumber);
    setIsOpen(false);
  };

  const handlePreviousEpisode = () => {
    if (currentEpisode > 1) {
      onEpisodeSelect(currentSeason, currentEpisode - 1);
    } else if (currentSeason > 1) {
      // Go to last episode of previous season
      // This would need season episode count, for now just go to episode 1 of previous season
      onEpisodeSelect(currentSeason - 1, 1);
    }
  };

  const handleNextEpisode = () => {
    const maxEpisode = episodes.length;
    if (currentEpisode < maxEpisode) {
      onEpisodeSelect(currentSeason, currentEpisode + 1);
    } else if (seasons.includes(currentSeason + 1)) {
      // Go to first episode of next season
      onEpisodeSelect(currentSeason + 1, 1);
    }
  };

  return (
    <>
      {/* Episode Selector Button */}
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        {/* Previous/Next Episode Buttons */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePreviousEpisode}
            className="bg-black/70 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm rounded-lg h-8 px-2"
            title="Previous Episode"
          >
            <ChevronRight className="rotate-180 w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleNextEpisode}
            className="bg-black/70 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm rounded-lg h-8 px-2"
            title="Next Episode"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Episodes List Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black/70 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm rounded-lg h-8 px-3 flex items-center gap-2"
        >
          <span className="text-xs font-medium">S{currentSeason}E{currentEpisode}</span>
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Episodes Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/20">
              <div>
                <h3 className="text-white font-semibold text-sm truncate">{showTitle}</h3>
                <p className="text-white/70 text-xs">Season {currentSeason}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 rounded-full h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Episodes List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <motion.div 
                    className="w-4 h-4 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-white mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-white/70 text-xs mt-2">Loading episodes...</p>
                </div>
              ) : episodes.length > 0 ? (
                <div className="p-2 space-y-1">
                  {episodes.map((episode) => (
                    <motion.div
                      key={episode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                        episode.episode_number === currentEpisode
                          ? "bg-primary/20 border border-primary/30" 
                          : "hover:bg-white/10 border border-transparent"
                      )}
                      onClick={() => handleEpisodeSelect(episode.episode_number)}
                    >
                      {/* Episode Thumbnail */}
                      <div className="w-12 h-7 bg-white/10 rounded overflow-hidden flex-shrink-0 relative">
                        {episode.still_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                            alt={episode.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-white/50" />
                          </div>
                        )}
                        
                        {/* Current episode indicator */}
                        {episode.episode_number === currentEpisode && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <Play className="w-3 h-3 text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={episode.episode_number === currentEpisode ? "default" : "secondary"} 
                            className="text-xs px-1.5 py-0.5 h-auto"
                          >
                            {episode.episode_number}
                          </Badge>
                          {episode.runtime && (
                            <span className="text-xs text-white/50">{episode.runtime}m</span>
                          )}
                        </div>
                        
                        <p className="text-white text-xs font-medium line-clamp-1 mb-1">
                          {episode.name}
                        </p>
                        
                        <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                          {episode.overview || "No description available."}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-white/70 text-xs">No episodes available.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InPlayerEpisodeSelector;