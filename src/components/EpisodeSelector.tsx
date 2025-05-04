
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  overview: string;
  air_date: string;
  runtime: number | null;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episodes: Episode[];
}

interface EpisodeSelectorProps {
  seasons: Season[];
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
  showId: number;
}

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  seasons,
  onEpisodeSelect,
  showId
}) => {
  const navigate = useNavigate();
  const [expandedSeason, setExpandedSeason] = useState<number | null>(seasons[0]?.season_number || null);
  const [selectedEpisode, setSelectedEpisode] = useState<{season: number, episode: number} | null>(null);

  useEffect(() => {
    // Set first season with episodes as expanded by default
    const firstValidSeason = seasons.find(season => 
      season.season_number > 0 && season.episodes && season.episodes.length > 0
    );
    
    if (firstValidSeason) {
      setExpandedSeason(firstValidSeason.season_number);
    }
  }, [seasons]);

  const handleSeasonToggle = (seasonNumber: number) => {
    setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber);
  };

  const handleEpisodeClick = (seasonNumber: number, episodeNumber: number) => {
    setSelectedEpisode({ season: seasonNumber, episode: episodeNumber });
    onEpisodeSelect(seasonNumber, episodeNumber);
  };

  const handleWatchNow = (seasonNumber: number, episodeNumber: number) => {
    navigate(`/watch/tv/${showId}/${seasonNumber}/${episodeNumber}`);
  };

  // Filter out seasons with no episodes
  const validSeasons = seasons.filter(season => 
    season.season_number > 0 && season.episodes && season.episodes.length > 0
  );

  if (validSeasons.length === 0) {
    return (
      <div className="w-full mt-6 p-4 text-center">
        <h2 className="text-xl font-semibold mb-2 text-gradient">Episodes</h2>
        <p className="text-muted-foreground">No episodes available for this show.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gradient">Episodes</h2>
      
      <div className="space-y-3 pb-6">
        {validSeasons.map((season) => (
          <Card key={season.id} className="bg-black/40 border-white/10 overflow-hidden hover:border-primary/20 transition-colors">
            <motion.div 
              className={cn(
                "flex justify-between items-center p-4 cursor-pointer hover:bg-black/60 transition-colors",
                expandedSeason === season.season_number && "border-b border-white/10"
              )}
              onClick={() => handleSeasonToggle(season.season_number)}
            >
              <div className="flex items-center gap-3">
                {expandedSeason === season.season_number ? (
                  <ChevronDown className="text-primary w-5 h-5" />
                ) : (
                  <ChevronRight className="text-white/70 w-5 h-5" />
                )}
                <h3 className="font-medium">Season {season.season_number}</h3>
                <span className="text-xs text-white/50">({season.episodes.length} episodes)</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {expandedSeason === season.season_number && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {season.episodes.map((episode) => (
                      <motion.div
                        key={episode.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "flex gap-3 p-3 rounded-lg cursor-pointer transition-all",
                          selectedEpisode?.season === season.season_number && 
                          selectedEpisode?.episode === episode.episode_number
                            ? "bg-primary/20 border border-primary/40"
                            : "hover:bg-white/5 border border-transparent"
                        )}
                        onClick={() => handleEpisodeClick(season.season_number, episode.episode_number)}
                      >
                        <div className="w-24 h-16 flex-shrink-0 bg-black/60 rounded overflow-hidden relative">
                          {episode.still_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                              alt={episode.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                              <span className="text-xs">No Preview</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 rounded-full bg-primary/80 hover:bg-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWatchNow(season.season_number, episode.episode_number);
                              }}
                            >
                              <Play size={12} className="text-white ml-0.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                              {episode.episode_number}
                            </span>
                            {episode.runtime && (
                              <span className="text-xs text-white/50">
                                {episode.runtime} min
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-medium line-clamp-1 mt-1.5">{episode.name}</h4>
                          <p className="text-xs text-white/50 line-clamp-2 mt-1">{episode.overview || "No description available."}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-full hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWatchNow(season.season_number, episode.episode_number);
                            }}
                          >
                            <Play size={16} className="text-primary ml-0.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EpisodeSelector;
