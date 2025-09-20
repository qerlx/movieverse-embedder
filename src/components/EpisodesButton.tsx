import React, { useState } from "react";
import { Play, ChevronDown, X, Calendar, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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

interface EpisodesButtonProps {
  showId: number;
  seasons: Season[];
  showTitle: string;
  className?: string;
}

const EpisodesButton: React.FC<EpisodesButtonProps> = ({
  showId,
  seasons,
  showTitle,
  className = ""
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [episodeData, setEpisodeData] = useState<{[key: number]: Episode[]}>({});
  const [loadingSeasons, setLoadingSeasons] = useState<{[key: number]: boolean}>({});

  // Filter valid seasons
  const validSeasons = seasons.filter(season => 
    season.season_number > 0 && season.episode_count > 0
  );

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
        const episodes = data.episodes || [];
        setEpisodeData(prev => ({ ...prev, [seasonNumber]: episodes }));
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

  const handleWatchEpisode = (seasonNumber: number, episodeNumber: number) => {
    setIsOpen(false);
    navigate(`/watch/tv/${showId}/${seasonNumber}/${episodeNumber}`);
  };

  return (
    <>
      {/* Episodes Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-xl",
          "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105",
          className
        )}
      >
        <Play size={16} />
        <span className="hidden sm:inline">Episodes</span>
        <span className="sm:hidden">Episodes</span>
        <ChevronDown size={14} className="opacity-70" />
      </Button>

      {/* Episodes Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{showTitle}</h2>
                  <p className="text-sm text-muted-foreground">Select an episode to watch</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-muted"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                {validSeasons.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No episodes available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validSeasons.map((season) => (
                      <Card key={season.id} className="border-border/50 overflow-hidden">
                        <motion.div
                          className={cn(
                            "flex justify-between items-center p-4 cursor-pointer transition-all duration-300",
                            expandedSeason === season.season_number 
                              ? "bg-primary/10 border-b border-primary/20" 
                              : "hover:bg-muted/50"
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
                              <ChevronDown className={cn(
                                "w-5 h-5 transition-colors",
                                expandedSeason === season.season_number ? "text-primary" : "text-muted-foreground"
                              )} />
                            </motion.div>
                            
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {season.name || `Season ${season.season_number}`}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Play size={12} />
                                  {season.episode_count} episodes
                                </span>
                                {season.air_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(season.air_date).getFullYear()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {loadingSeasons[season.season_number] && (
                            <div className="text-sm text-primary">Loading...</div>
                          )}
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
                              <div className="p-4 space-y-3 bg-muted/20">
                                {loadingSeasons[season.season_number] ? (
                                  <div className="flex justify-center py-8">
                                    <motion.div 
                                      className="w-6 h-6 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                  </div>
                                ) : episodeData[season.season_number]?.length > 0 ? (
                                  <div className="grid gap-3 sm:grid-cols-1">
                                    {episodeData[season.season_number].map((episode) => (
                                      <motion.div
                                        key={episode.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-all duration-300 hover:bg-primary/5"
                                        onClick={() => handleWatchEpisode(season.season_number, episode.episode_number)}
                                      >
                                        {/* Episode Thumbnail */}
                                        <div className="w-20 h-12 md:w-24 md:h-14 flex-shrink-0 bg-muted rounded-lg overflow-hidden relative">
                                          {episode.still_path ? (
                                            <img 
                                              src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                              alt={episode.name}
                                              className="w-full h-full object-cover"
                                              loading="lazy"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                              <Play size={16} />
                                            </div>
                                          )}
                                          
                                          {/* Play overlay */}
                                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Play size={16} className="text-white" />
                                          </div>
                                        </div>
                                        
                                        {/* Episode Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <Badge variant="secondary" className="text-xs">
                                              E{episode.episode_number}
                                            </Badge>
                                            {episode.runtime && (
                                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock size={10} />
                                                {episode.runtime}m
                                              </span>
                                            )}
                                            {episode.vote_average > 0 && (
                                              <span className="text-xs text-yellow-600 flex items-center gap-1">
                                                <Star size={10} fill="currentColor" />
                                                {episode.vote_average.toFixed(1)}
                                              </span>
                                            )}
                                          </div>
                                          
                                          <h4 className="font-medium text-sm line-clamp-1 text-foreground mb-1">
                                            {episode.name}
                                          </h4>
                                          
                                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1">
                                            {episode.overview || "No description available."}
                                          </p>
                                          
                                          {episode.air_date && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                              <Calendar size={10} />
                                              {new Date(episode.air_date).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground">
                                    No episodes available for this season.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EpisodesButton;