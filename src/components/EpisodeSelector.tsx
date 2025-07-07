
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Play, Clock, Calendar, Star } from "lucide-react";
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
  vote_average: number;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episodes?: Episode[];
  episode_count: number;
  air_date: string;
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
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<{season: number, episode: number} | null>(null);
  const [episodeData, setEpisodeData] = useState<{[key: number]: Episode[]}>({});
  const [loadingSeasons, setLoadingSeasons] = useState<{[key: number]: boolean}>({});

  // Filter valid seasons (exclude specials and seasons with no episodes)
  const validSeasons = seasons.filter(season => 
    season.season_number > 0 && season.episode_count > 0
  );

  useEffect(() => {
    // Set first valid season as expanded by default and fetch episodes immediately
    if (validSeasons.length > 0 && expandedSeason === null) {
      const firstSeason = validSeasons[0].season_number;
      setExpandedSeason(firstSeason);
    }
  }, [validSeasons.length, expandedSeason]);

  // Separate effect to fetch episodes when a season is expanded
  useEffect(() => {
    if (expandedSeason !== null && !episodeData[expandedSeason] && !loadingSeasons[expandedSeason]) {
      fetchSeasonEpisodes(expandedSeason);
    }
  }, [expandedSeason, episodeData, loadingSeasons]);

  const fetchSeasonEpisodes = async (seasonNumber: number) => {
    if (episodeData[seasonNumber] || loadingSeasons[seasonNumber]) return;
    
    setLoadingSeasons(prev => ({ ...prev, [seasonNumber]: true }));
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?language=en-US`,
        {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQzYzU2N2ZhZTk3Y2JlZGM0OGQ1YWQ0Yjg5M2YzMSIsIm5iZiI6MTc0MTc1NzA2NC43MzMsInN1YiI6IjY3ZDExYTg4MTM5OTBhMDU4YjYwYWExMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PfUfbFyxCtI3bJehMrDRUuuKOPp58WC-_4B4aUovCyA'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched season ${seasonNumber} data:`, data);
        const episodes = data.episodes || [];
        console.log(`Found ${episodes.length} episodes for season ${seasonNumber}`);
        setEpisodeData(prev => ({ ...prev, [seasonNumber]: episodes }));
      } else {
        console.error(`Failed to fetch season ${seasonNumber}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching episodes for season ${seasonNumber}:`, error);
    } finally {
      setLoadingSeasons(prev => ({ ...prev, [seasonNumber]: false }));
    }
  };

  const handleSeasonToggle = (seasonNumber: number) => {
    const newExpanded = expandedSeason === seasonNumber ? null : seasonNumber;
    setExpandedSeason(newExpanded);
    
    if (newExpanded && !episodeData[seasonNumber]) {
      fetchSeasonEpisodes(seasonNumber);
    }
  };

  const handleEpisodeClick = (seasonNumber: number, episodeNumber: number) => {
    setSelectedEpisode({ season: seasonNumber, episode: episodeNumber });
    onEpisodeSelect(seasonNumber, episodeNumber);
  };

  const handleWatchNow = (seasonNumber: number, episodeNumber: number) => {
    navigate(`/watch/tv/${showId}/${seasonNumber}/${episodeNumber}`);
  };

  if (validSeasons.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-8 p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-3 text-white">Episodes</h2>
          <p className="text-muted-foreground">No episodes available for this show.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-4 mt-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
          <Play size={16} className="text-primary ml-0.5" />
        </div>
        <h2 className="text-xl font-bold text-white">
          Episodes
        </h2>
      </div>
      
      <div className="space-y-3">
        {validSeasons.map((season, index) => (
          <motion.div
            key={season.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="border-white/10 bg-black/20 backdrop-blur-md overflow-hidden hover:border-primary/20 transition-all shadow-lg">
              <motion.div 
                className={cn(
                  "flex justify-between items-center p-3 md:p-4 cursor-pointer hover:bg-black/40 transition-all duration-300 rounded-t-lg",
                  expandedSeason === season.season_number && "border-b border-white/10 bg-primary/5"
                )}
                onClick={() => handleSeasonToggle(season.season_number)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: expandedSeason === season.season_number ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {expandedSeason === season.season_number ? (
                      <ChevronDown className="text-primary w-5 h-5" />
                    ) : (
                      <ChevronRight className="text-white/70 w-5 h-5" />
                    )}
                  </motion.div>
                  
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-white mb-1 flex items-center gap-2">
                      Season {season.season_number}
                      {expandedSeason === season.season_number && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Open
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Play size={10} className="md:w-3 md:h-3" />
                        {season.episode_count} episodes
                      </span>
                      {season.air_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} className="md:w-3 md:h-3" />
                          {new Date(season.air_date).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-primary/60 text-sm">
                  {loadingSeasons[season.season_number] && "Loading..."}
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedSeason === season.season_number && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3 bg-black/10">
                      {loadingSeasons[season.season_number] ? (
                        <div className="flex justify-center py-8">
                          <motion.div 
                            className="w-6 h-6 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      ) : episodeData[season.season_number]?.length > 0 ? (
                        episodeData[season.season_number].map((episode, episodeIndex) => (
                          <motion.div
                            key={episode.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: episodeIndex * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className={cn(
                              "flex gap-2 md:gap-3 p-2 md:p-3 rounded-lg cursor-pointer transition-all duration-300 group border",
                              selectedEpisode?.season === season.season_number && 
                              selectedEpisode?.episode === episode.episode_number
                                ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/20"
                                : "hover:bg-white/5 border-transparent hover:border-white/10 hover:shadow-md"
                            )}
                            onClick={() => handleEpisodeClick(season.season_number, episode.episode_number)}
                          >
                            <div className="w-16 h-12 md:w-24 md:h-16 flex-shrink-0 bg-black/40 rounded-md overflow-hidden relative group">
                              {episode.still_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                  alt={episode.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30">
                                  <Play size={16} className="opacity-50" />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8 rounded-full bg-primary/90 hover:bg-primary text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWatchNow(season.season_number, episode.episode_number);
                                  }}
                                >
                                  <Play size={12} className="ml-0.5" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center gap-1 md:gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold bg-primary/20 text-primary px-1.5 md:px-2 py-0.5 rounded">
                                  E{episode.episode_number}
                                </span>
                                {episode.runtime && (
                                  <span className="text-xs text-white/50 flex items-center gap-1">
                                    <Clock size={8} className="md:w-2.5 md:h-2.5" />
                                    {episode.runtime}m
                                  </span>
                                )}
                                {episode.vote_average > 0 && (
                                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                                    <Star size={8} className="md:w-2.5 md:h-2.5" fill="currentColor" />
                                    {episode.vote_average.toFixed(1)}
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="text-xs md:text-sm font-medium line-clamp-1 mb-1 text-white group-hover:text-primary transition-colors">
                                {episode.name}
                              </h4>
                              
                              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed hidden md:block">
                                {episode.overview || "No description available."}
                              </p>
                              
                              {episode.air_date && (
                                <p className="text-xs text-white/40 mt-1">
                                  {new Date(episode.air_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-white/60">
                          No episodes available for this season.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EpisodeSelector;
