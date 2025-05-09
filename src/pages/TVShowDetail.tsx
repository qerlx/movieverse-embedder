import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { Star, Calendar, Play, ChevronDown, AlertTriangle, Tv2, Calendar as CalendarIcon, Clock, Film, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TVShow, Season, Episode, Cast } from "@/types";
import CategoryRow from "@/components/CategoryRow";
import FavoriteButton from "@/components/FavoriteButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TVShowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [tvShow, setTVShow] = useState<any | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  // Custom theme color for Vidora player
  const vidoraThemeColor = "00ff9d";
  
  // Server options
  const [selectedServer, setSelectedServer] = useState("vidora");
  
  useEffect(() => {
    const fetchTVShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const tvShowId = parseInt(id);
        const data = await getTVShowDetails(tvShowId);
        setTVShow(data);
        
        if (data.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons.find(
            (season: Season) => season.season_number > 0
          );
          if (firstSeason) {
            setSelectedSeason(firstSeason.season_number);
          }
        }
      } catch (error) {
        console.error("Error fetching TV show details:", error);
        toast({
          title: "Error",
          description: "Failed to load TV show details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVShowDetails();
    // Scroll to top when navigating to a new TV show
    window.scrollTo(0, 0);
  }, [id, toast]);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!id || !selectedSeason) return;
      
      try {
        setIsLoadingSeason(true);
        setEpisodesError(null);
        
        const tvShowId = parseInt(id);
        console.log(`Starting request for show ${tvShowId}, season ${selectedSeason}, retry: ${retryCount}`);
        
        const data = await getTVShowSeasonDetails(tvShowId, selectedSeason);
        console.log("Season details response:", data);
        
        if (data.success === false) {
          console.error("Failed to load episode data:", data.status_message);
          setEpisodesError(`Episodes are not available for this season. ${data.status_message || ''}`);
          setSeasonDetails({ episodes: [] });
        } else if (!data.episodes || data.episodes.length === 0) {
          setEpisodesError("No episodes found for this season.");
          setSeasonDetails({ episodes: [] });
        } else {
          const processedEpisodes = data.episodes.map((episode: any, index: number) => {
            if (!episode.episode_number || episode.episode_number <= 0) {
              return { ...episode, episode_number: index + 1 };
            }
            return episode;
          });
          setSeasonDetails({ ...data, episodes: processedEpisodes });
          
          // Set the first episode as default
          if (processedEpisodes.length > 0) {
            setSelectedEpisode(processedEpisodes[0].episode_number);
          }
        }
      } catch (error) {
        console.error("Error fetching season details:", error);
        setEpisodesError("Failed to load episodes. Try another season if available.");
        setSeasonDetails({ episodes: [] });
        
        if (retryCount === 0) {
          setRetryCount(1);
          setTimeout(() => {
            console.log("Retrying season fetch...");
            setRetryCount(0);
          }, 2000);
        }
      } finally {
        setIsLoadingSeason(false);
      }
    };

    if (tvShow) {
      fetchSeasonDetails();
    }
  }, [id, selectedSeason, tvShow, retryCount, toast]);

  const handleWatchClick = (episodeNumber: number) => {
    navigate(`/watch/tv/${id}/${selectedSeason}/${episodeNumber}`);
  };
  
  const handleServerSelect = (server: string, episodeNumber: number) => {
    if (server === "vidora") {
      // Default is already Vidora
      navigate(`/watch/tv/${id}/${selectedSeason}/${episodeNumber}`);
    } else {
      // Pass a query param to indicate server
      navigate(`/watch/tv/${id}/${selectedSeason}/${episodeNumber}?server=${server}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="relative w-16 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <motion.div 
            className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-primary border-b-primary border-l-transparent animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
        </motion.div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 backdrop-blur-lg bg-black/40 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-2 purple-text-gradient">TV Show Not Found</h2>
          <p className="text-muted-foreground mb-6">The TV show you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/tv-shows")} className="premium-button premium-button-primary">Browse TV Shows</Button>
        </div>
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
    : null;
  
  const posterUrl = tvShow.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : "/placeholder.svg";

  const firstAirYear = tvShow.first_air_date
    ? new Date(tvShow.first_air_date).getFullYear()
    : "Unknown";
  
  const creators = tvShow.created_by || [];
  
  const topCast = tvShow.credits?.cast?.slice(0, 6) || [];
  
  const actualSeasons = tvShow.seasons?.filter(
    (season: Season) => season.season_number > 0
  ) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <motion.div 
              initial={{ filter: "blur(16px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="w-full h-[70vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-12 pb-8 min-h-[70vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-xs mx-auto md:mx-0"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 purple-glow">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Video Player Options Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8"
              >
                <Card className="border-primary/20 bg-black/30 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gradient text-xl">Watch Now</CardTitle>
                    <CardDescription>Select season, episode and streaming option</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Season</label>
                        <Select
                          value={selectedSeason.toString()}
                          onValueChange={(value) => setSelectedSeason(parseInt(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Season" />
                          </SelectTrigger>
                          <SelectContent>
                            {actualSeasons.map((season: Season) => (
                              <SelectItem
                                key={season.id}
                                value={season.season_number.toString()}
                              >
                                Season {season.season_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Episode</label>
                        <Select
                          value={selectedEpisode.toString()}
                          onValueChange={(value) => setSelectedEpisode(parseInt(value))}
                          disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Episode" />
                          </SelectTrigger>
                          <SelectContent>
                            {seasonDetails?.episodes?.map((episode: Episode) => (
                              <SelectItem
                                key={episode.id || `ep-${episode.episode_number}`}
                                value={episode.episode_number.toString()}
                              >
                                Ep {episode.episode_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleWatchClick(selectedEpisode)}
                      className="w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-4 py-6 shadow-lg hover:shadow-primary/30 transition-all"
                      disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                    >
                      <Play size={22} className="ml-1" />
                      Watch with Vidora
                      <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
                    </Button>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-2 rounded-full border-white/10", 
                          selectedServer === "vidsrc" && "border-primary/50 bg-primary/10 text-primary"
                        )}
                        onClick={() => handleServerSelect("vidsrc", selectedEpisode)}
                        disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                      >
                        <MonitorPlay size={14} />
                        VidSrc
                        <span className="text-xs opacity-70">(Second Best)</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-2 rounded-full border-white/10", 
                          selectedServer === "server3" && "border-primary/50 bg-primary/10 text-primary"
                        )}
                        onClick={() => handleServerSelect("server3", selectedEpisode)}
                        disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                      >
                        <MonitorPlay size={14} />
                        MultiEmbed
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-2 rounded-full border-white/10",
                          selectedServer === "server4" && "border-primary/50 bg-primary/10 text-primary"
                        )}
                        onClick={() => handleServerSelect("server4", selectedEpisode)}
                        disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                      >
                        <MonitorPlay size={14} />
                        Embed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1"
            >
              <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="cinematic-title text-4xl md:text-6xl font-bold mb-4 text-white text-shadow"
              >
                {tvShow.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                {tvShow.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm backdrop-blur-sm bg-black/30 border border-white/10 text-white/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-6 mb-6 text-sm"
              >
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                    <Star size={16} className="text-yellow-400" />
                    <span className="font-medium">{tvShow.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Calendar size={16} className="text-white/80" />
                  <span>{firstAirYear}</span>
                </div>
                
                <div className="text-sm flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Tv2 size={16} className="text-white/80" />
                  <span>{tvShow.number_of_seasons} Seasons</span>
                  <span className="mx-1">·</span>
                  <span>{tvShow.number_of_episodes} Episodes</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-6 max-w-2xl"
              >
                <h2 className="text-xl font-semibold mb-2 text-white/90">Overview</h2>
                <p className="text-white/70 leading-relaxed">{tvShow.overview}</p>
              </motion.div>
              
              {creators.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-semibold mb-2 text-white/90">Created By</h2>
                  <div className="flex flex-wrap gap-2">
                    {creators.map((creator: any) => (
                      <span key={creator.id} className="text-white/70">
                        {creator.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button
                  onClick={() => handleWatchClick(selectedEpisode)}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-primary/30 transition-all"
                  disabled={isLoadingSeason || !seasonDetails?.episodes?.length}
                >
                  <Play size={22} className="ml-1" />
                  Watch Now
                </Button>
                
                {currentUser && (
                  <FavoriteButton
                    id={show.id} 
                    type="tv" 
                    name={show.name}
                    posterPath={show.poster_path}
                    variant="default" // Changed from "outline" to "default"
                    className="w-full flex-1"
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Tv2 className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Episodes</h2>
          </div>
          
          {tvShow.seasons && tvShow.seasons.length > 0 && (
            <div className="w-full md:w-auto">
              <Select
                value={selectedSeason.toString()}
                onValueChange={(value) => setSelectedSeason(parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent>
                  {tvShow.seasons
                    .filter((season: Season) => season.season_number > 0)
                    .map((season: Season) => (
                      <SelectItem
                        key={season.id}
                        value={season.season_number.toString()}
                      >
                        Season {season.season_number} {season.name !== `Season ${season.season_number}` && `(${season.name})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoadingSeason ? (
          <div className="py-8 flex justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            />
          </div>
        ) : (
          <>
            {episodesError ? (
              <div className="py-8">
                <Card className="border-orange-200 bg-orange-50/10">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="mr-4 bg-orange-100 rounded-full p-2">
                      <AlertTriangle size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold">Episodes Unavailable</CardTitle>
                      <CardDescription>{episodesError}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Try selecting a different season or check back later.
                    </p>
                    
                    <div className="p-4 border border-border rounded-lg bg-card/50">
                      <h3 className="font-medium mb-2">Quick Episode Access</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try accessing specific episodes directly:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(epNum => (
                          <Button 
                            key={epNum} 
                            size="sm" 
                            className="gap-1 bg-primary/80 hover:bg-primary"
                            onClick={() => handleWatchClick(epNum)}
                          >
                            <Play size={14} /> Episode {epNum}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : seasonDetails?.episodes?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {seasonDetails.episodes.map((episode: Episode, index: number) => (
                  <Card key={episode.id || `ep-${episode.episode_number}`} 
                    className={cn(
                      "overflow-hidden transition-all duration-200 hover:shadow-lg border border-border/50 group",
                    )}
                  >
                    <div className="aspect-video bg-muted/20 relative overflow-hidden">
                      {episode.still_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                          alt={episode.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
                          <Film className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <Button
                            onClick={() => handleWatchClick(episode.episode_number)}
                            className="w-full gap-2"
                            size="sm"
                          >
                            <Play size={16} className="mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        Episode {episode.episode_number}
                      </Badge>
                    </div>
                    
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold line-clamp-1">
                          {episode.name || `Episode ${episode.episode_number}`}
                        </CardTitle>
                        {episode.vote_average > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="text-yellow-400" />
                            <span>{episode.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <CalendarIcon size={12} className="mr-1" />
                          {episode.air_date || "Unknown"}
                        </span>
                        {(episode as any).runtime && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock size={12} className="mr-1" />
                            {(episode as any).runtime} min
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {episode.overview || "No overview available for this episode."}
                      </p>
                    </CardContent>
                    
                    <Collapsible>
                      <div className="px-4 pb-0">
                        <Separator className="my-1" />
                        <CollapsibleTrigger className="w-full flex items-center justify-center text-xs text-muted-foreground py-2 hover:text-primary transition-colors">
                          <span>Show more</span>
                          <ChevronDown size={14} className="ml-1" />
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm">
                            {episode.overview || "No overview available for this episode."}
                          </p>
                          <div className="flex justify-end mt-2">
                            <Button
                              onClick={() => handleWatchClick(episode.episode_number)}
                              size="sm"
                              className="gap-1"
                            >
                              <Play size={14} />
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No episodes found for this season. Try selecting a different season.
              </div>
            )}
          </>
        )}
      </div>

      {topCast.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topCast.map((person: Cast) => (
              <div key={person.id} className="animate-fade-in">
                <div className="rounded-lg overflow-hidden bg-muted/20">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-48 object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-muted/20">
                      <span className="text-muted-foreground">No Photo</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tvShow.similar?.results?.length > 0 && (
        <div className="py-8">
          <CategoryRow
            title="Similar TV Shows"
            items={tvShow.similar.results}
            type="tv"
          />
        </div>
      )}
    </motion.div>
  );
};

export default TVShowDetail;
