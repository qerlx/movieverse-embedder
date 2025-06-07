
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails } from "@/lib/api";
import { Star, Clock, Calendar, Play, Tv } from "lucide-react";
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
import { motion } from "framer-motion";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
  episodes?: Episode[];
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

  // Video sources list
  const videoSources: VideoSource[] = [
    { id: "vidora", name: "Vidora", icon: <Play size={16} className="mr-1" /> },
    { id: "vidsrc", name: "VidSrc", icon: <Tv size={16} className="mr-1" /> },
    { id: "vidzee", name: "Vidzee", icon: <Tv size={16} className="mr-1" /> },
    { id: "vidjoy", name: "Vidjoy", icon: <Tv size={16} className="mr-1" /> }
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
    // Scroll to top when navigating to a new show
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

  // Loading and error states
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
          <Button onClick={() => navigate("/tv")} className="premium-button premium-button-primary">Browse TV Shows</Button>
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Hero section with backdrop */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <motion.div 
              initial={{ filter: "blur(16px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="w-full h-[80vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-20 pb-10 min-h-[80vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                      target.src = '/placeholder.svg';
                    }
                  }}
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
                  <CardContent className="space-y-3 p-4">
                    <h3 className="text-gradient text-xl mb-2 font-semibold">Watch Options</h3>
                    
                    {/* Video source buttons */}
                    <div className="space-y-2">
                      {videoSources.map((source, index) => (
                        <Button 
                          key={source.id}
                          onClick={() => handleWatchClick(source.id)}
                          className={
                            index === 0 
                              ? "w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-4 py-6 shadow-lg hover:shadow-primary/30 transition-all" 
                              : "w-full bg-black/60 hover:bg-black/80 text-white gap-2 rounded-full px-4 py-4 border border-primary/30 hover:border-primary/50 transition-all mt-2"
                          }
                          size={index === 0 ? "lg" : "default"}
                        >
                          {source.icon}
                          Watch with {source.name}
                          {index === 0 && <span className="text-xs ml-1 opacity-70">(Recommended)</span>}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-4"
              >
                <WatchProviders id={parseInt(id!)} type="tv" />
              </motion.div>
            </motion.div>

            {/* Details */}
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
                
                {tvShow.number_of_seasons && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                    <Tv size={16} className="text-white/80" />
                    <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Calendar size={16} className="text-white/80" />
                  <span>{firstAirYear}</span>
                </div>
                
                {/* Media type indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Tv size={16} className="text-purple-400" />
                  <span>TV Show</span>
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
                  <h2 className="text-xl font-semibold mb-2 text-white/90">Created by</h2>
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
                  onClick={() => handleWatchClick()}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <Play size={22} className="ml-1" />
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
                      size="lg"
                    />
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cast section */}
      {topCast.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-12 bg-gradient-to-b from-transparent to-black/30"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 purple-text-gradient">
              Featured Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="premium-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-48 object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-black/50">
                      <span className="text-muted-foreground">No Photo</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {person.character}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Seasons */}
      {tvShow.seasons && tvShow.seasons.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="py-12"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 purple-text-gradient">Seasons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {tvShow.seasons
                .filter((season: Season) => season.season_number > 0)
                .map((season: Season, index: number) => (
                <motion.div 
                  key={season.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="premium-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleWatchClick(undefined, season.season_number, 1)}
                >
                  {season.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                      alt={season.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-black/50 group-hover:scale-105 transition-transform duration-300">
                      <Tv className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-1">{season.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {season.episode_count} episodes
                    </p>
                    {season.air_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(season.air_date).getFullYear()}
                      </p>
                    )}
                  </div>
                  
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-white" />
                  </div>
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
          <CategoryRow
            title="More Like This"
            items={tvShow.similar.results}
            type="tv"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default TVShowDetail;
