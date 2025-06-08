
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails } from "@/lib/api";
import { Star, Calendar, Play, Tv, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import EpisodeSelector from "@/components/EpisodeSelector";
import LogoTitle from "@/components/LogoTitle";
import { motion } from "framer-motion";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface VideoSource {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

const TVShowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [tvShow, setTVShow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced video sources list
  const videoSources: VideoSource[] = [
    { id: "vidora", name: "Vidora", icon: <Play size={16} className="mr-2" /> },
    { id: "vidsrc", name: "VidSrc", icon: <Tv size={16} className="mr-2" /> },
    { id: "vidzee", name: "Vidzee", icon: <Tv size={16} className="mr-2" /> },
    { id: "vidjoy", name: "Vidjoy", icon: <Tv size={16} className="mr-2" /> }
  ];
  
  useEffect(() => {
    const fetchTVShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const showId = parseInt(id);
        const data = await getTVShowDetails(showId);
        setTVShow(data);
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
    window.scrollTo(0, 0);
  }, [id, toast]);

  // Handle watch button click for specific source
  const handleWatchClick = (source?: string, season: number = 1, episode: number = 1) => {
    if (id) {
      if (source) {
        navigate(`/watch/tv/${id}/${season}/${episode}?source=${source}`);
      } else {
        navigate(`/watch/tv/${id}/${season}/${episode}`);
      }
    }
  };

  // Handle episode selection
  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    if (id) {
      navigate(`/watch/tv/${id}/${seasonNumber}/${episodeNumber}`);
    }
  };

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <motion.div 
          className="relative w-16 h-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-3 border-t-primary border-r-primary/30 border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md p-8 backdrop-blur-lg bg-black/40 rounded-2xl border border-primary/20"
        >
          <h2 className="text-2xl font-bold mb-3 text-white">
            TV Show Not Found
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The TV show you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate("/tv")} 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-full px-6 py-3"
          >
            Browse TV Shows
          </Button>
        </motion.div>
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
  
  const lastAirYear = tvShow.last_air_date
    ? new Date(tvShow.last_air_date).getFullYear()
    : null;
  
  const yearRange = lastAirYear && lastAirYear !== firstAirYear 
    ? `${firstAirYear} - ${lastAirYear}`
    : firstAirYear;
  
  const creators = tvShow.created_by || [];
  const topCast = tvShow.credits?.cast?.slice(0, 8) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background"
    >
      {/* Enhanced Hero section */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <motion.div 
              initial={{ filter: "blur(20px)", opacity: 0, scale: 1.1 }}
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full h-[80vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        )}

        <div className="relative container mx-auto px-6 pt-20 pb-8 min-h-[80vh] flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto">
            {/* Enhanced Poster Section */}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-sm mx-auto lg:mx-0"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                      target.src = '/placeholder.svg';
                    }
                  }}
                />
              </div>
              
              {/* Enhanced Watch Options Card */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-6"
              >
                <Card className="border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">
                        Watch Options
                      </h3>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                        <Tv size={12} className="text-purple-400" />
                        <span className="text-purple-300 text-xs font-medium">TV</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {videoSources.map((source, index) => (
                        <Button 
                          key={source.id}
                          onClick={() => handleWatchClick(source.id)}
                          className={
                            index === 0 
                              ? "w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 rounded-full py-4 text-sm font-medium shadow-lg hover:shadow-primary/20 transition-all" 
                              : "w-full bg-black/40 hover:bg-black/60 text-white gap-2 rounded-full py-3 border border-white/10 hover:border-white/20 transition-all text-sm"
                          }
                          size={index === 0 ? "default" : "sm"}
                        >
                          {source.icon}
                          {source.name}
                          {index === 0 && <span className="text-xs opacity-80">(Recommended)</span>}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Watch Providers */}
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-4"
              >
                <WatchProviders id={parseInt(id!)} type="tv" />
              </motion.div>
            </motion.div>

            {/* Enhanced Details Section */}
            <motion.div 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 max-w-4xl"
            >
              {/* Enhanced Title with Logo */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <LogoTitle
                  id={tvShow.id}
                  title={tvShow.name}
                  type="tv"
                  className="max-w-3xl h-16 sm:h-20 md:h-24 object-contain mb-3"
                  fallbackClassName="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
                />
              </motion.div>
              
              {/* Compact Stats Row */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-sm">{tvShow.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                {tvShow.number_of_seasons && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Tv size={14} className="text-blue-400" />
                    <span className="font-semibold text-sm">
                      {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {tvShow.number_of_episodes && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
                    <Play size={14} className="text-green-400" />
                    <span className="font-semibold text-sm">{tvShow.number_of_episodes} Episodes</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Calendar size={14} className="text-purple-400" />
                  <span className="font-semibold text-sm">{yearRange}</span>
                </div>
              </motion.div>
              
              {/* Enhanced Genres */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {tvShow.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/20 text-white/90 hover:border-primary/30 transition-all duration-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>
              
              {/* Enhanced Overview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-6"
              >
                <h2 className="text-lg font-semibold mb-3 text-white/90">Overview</h2>
                <p className="text-white/80 leading-relaxed max-w-4xl">
                  {tvShow.overview}
                </p>
              </motion.div>
              
              {/* Enhanced Creators */}
              {creators.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-6"
                >
                  <h2 className="text-lg font-semibold mb-3 text-white/90">Created by</h2>
                  <div className="flex flex-wrap gap-2">
                    {creators.map((creator: any) => (
                      <span 
                        key={creator.id} 
                        className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30 text-white/90 font-medium text-sm"
                      >
                        {creator.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Enhanced Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-wrap gap-3 mt-6"
              >
                <Button
                  onClick={() => handleWatchClick()}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <Play size={18} className="ml-1" />
                  Watch Now
                </Button>
                
                {currentUser && (
                  <>
                    <FavoriteButton
                      id={tvShow.id} 
                      type="tv" 
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      variant="outline"
                    />
                    <AddToWatchedButton
                      itemId={tvShow.id}
                      itemType="tv"
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      variant="outline"
                    />
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Episode Selector Section */}
      {tvShow.seasons && tvShow.seasons.length > 0 && (
        <div className="bg-gradient-to-b from-transparent to-black/20">
          <div className="container mx-auto px-6">
            <EpisodeSelector
              seasons={tvShow.seasons}
              onEpisodeSelect={handleEpisodeSelect}
              showId={parseInt(id!)}
            />
          </div>
        </div>
      )}

      {/* Enhanced Cast section */}
      {topCast.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-12"
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
                <Users size={16} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Featured Cast
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group cursor-pointer"
                >
                  <Card className="border-white/10 bg-black/20 backdrop-blur-md overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/80">
                        <Users className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1 text-white group-hover:text-primary transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-1">
                        {person.character}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Similar shows */}
      {tvShow.similar?.results?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-12"
        >
          <div className="container mx-auto px-6">
            <CategoryRow
              title="More Like This"
              items={tvShow.similar.results}
              type="tv"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TVShowDetail;
