
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
          className="relative w-20 h-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-3 border-t-primary border-r-primary/30 border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-primary border-l-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TV Show Not Found
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            The TV show you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate("/tv")} 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-full px-6 py-6"
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
              className="w-full h-[90vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        )}

        <div className="relative container mx-auto px-6 pt-24 pb-12 min-h-[90vh] flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto">
            {/* Enhanced Poster Section */}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-sm mx-auto lg:mx-0"
            >
              <div className="overflow-hidden rounded-3xl shadow-2xl hover:shadow-primary/30 transition-all duration-500 group">
                <motion.img
                  whileHover={{ scale: 1.05 }}
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
                className="mt-8"
              >
                <Card className="border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Watch Options
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                        <Tv size={16} className="text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">TV Show</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {videoSources.map((source, index) => (
                        <Button 
                          key={source.id}
                          onClick={() => handleWatchClick(source.id)}
                          className={
                            index === 0 
                              ? "w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 rounded-full py-6 text-base font-medium shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02]" 
                              : "w-full bg-black/60 hover:bg-black/80 text-white gap-2 rounded-full py-4 border border-primary/30 hover:border-primary/50 transition-all transform hover:scale-[1.02]"
                          }
                          size={index === 0 ? "lg" : "default"}
                        >
                          {source.icon}
                          Watch with {source.name}
                          {index === 0 && <span className="text-xs ml-2 opacity-80">(Recommended)</span>}
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
                className="mt-6"
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
                className="mb-8"
              >
                <LogoTitle
                  id={tvShow.id}
                  title={tvShow.name}
                  type="tv"
                  className="max-w-3xl h-20 sm:h-24 md:h-28 object-contain mb-4"
                  fallbackClassName="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
                />
              </motion.div>
              
              {/* Enhanced Stats Row */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                    <Star size={20} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg">{tvShow.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                {tvShow.number_of_seasons && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-colors">
                    <Tv size={20} className="text-blue-400" />
                    <span className="font-bold text-lg">
                      {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {tvShow.number_of_episodes && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 transition-colors">
                    <Play size={20} className="text-green-400" />
                    <span className="font-bold text-lg">{tvShow.number_of_episodes} Episodes</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-colors">
                  <Calendar size={20} className="text-purple-400" />
                  <span className="font-bold text-lg">{yearRange}</span>
                </div>
              </motion.div>
              
              {/* Enhanced Genres */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {tvShow.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 rounded-full text-sm backdrop-blur-sm bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-white hover:border-primary/50 transition-all duration-300 hover:scale-105"
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
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 text-white/90">Overview</h2>
                <p className="text-white/80 leading-relaxed text-lg max-w-4xl">
                  {tvShow.overview}
                </p>
              </motion.div>
              
              {/* Enhanced Creators */}
              {creators.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4 text-white/90">Created by</h2>
                  <div className="flex flex-wrap gap-4">
                    {creators.map((creator: any) => (
                      <span 
                        key={creator.id} 
                        className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full border border-primary/30 text-white/90 font-medium"
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
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button
                  onClick={() => handleWatchClick()}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-3 rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105"
                >
                  <Play size={24} className="ml-1" />
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
                      size="lg"
                    />
                    <AddToWatchedButton
                      itemId={tvShow.id}
                      itemType="tv"
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      variant="outline"
                      size="lg"
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
        <div className="bg-gradient-to-b from-transparent via-black/10 to-black/20">
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
          className="py-16 bg-gradient-to-b from-transparent to-black/30"
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30">
                <Users size={24} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Featured Cast
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group cursor-pointer"
                >
                  <Card className="border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/80">
                        <Users className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1 text-white group-hover:text-primary transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2">
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
          className="py-16"
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
