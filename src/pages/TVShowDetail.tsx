
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails } from "@/lib/api";
import { Star, Calendar, Play, Tv, Users, Clock, Info, PlayCircle, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import EpisodeSelector from "@/components/EpisodeSelector";
import LogoTitle from "@/components/LogoTitle";
import MovieInfoCard from "@/components/MovieInfoCard";
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
      className="min-h-screen bg-background"
    >
      {/* Hero Section with MovieInfoCard */}
      <MovieInfoCard 
        movie={{
          ...tvShow,
          title: tvShow.name, // Map TV show name to movie title
          runtime: tvShow.episode_run_time?.[0] || null, // Use episode runtime
          release_date: tvShow.first_air_date, // Use first air date
        }} 
        onWatchClick={() => handleWatchClick()}
      >
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
              genres={tvShow.genres?.map((g: any) => g.id)}
            />
          </>
        )}
      </MovieInfoCard>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Tabs defaultValue="episodes" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-card/50 backdrop-blur-md rounded-full border border-white/10">
              <TabsTrigger 
                value="episodes" 
                className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Episodes
              </TabsTrigger>
              <TabsTrigger 
                value="similar" 
                className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Similar
              </TabsTrigger>
              <TabsTrigger 
                value="extras" 
                className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Extras
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                About
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="episodes" className="mt-8">
              {tvShow.seasons && tvShow.seasons.length > 0 && (
                <EpisodeSelector
                  seasons={tvShow.seasons}
                  onEpisodeSelect={handleEpisodeSelect}
                  showId={parseInt(id!)}
                />
              )}
            </TabsContent>

            <TabsContent value="similar" className="mt-8">
              {tvShow.similar?.results?.length > 0 ? (
                <CategoryRow
                  title="You May Also Like"
                  items={tvShow.similar.results}
                  type="tv"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No similar shows found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="extras" className="mt-8">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Extras and behind-the-scenes content coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Overview */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">About {tvShow.name}</h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    {tvShow.overview}
                  </p>
                </div>

                {/* Show Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Show Details</h4>
                    <div className="space-y-3 text-white/70">
                      <div className="flex justify-between">
                        <span className="text-white/90">First Air Date:</span>
                        <span>{new Date(tvShow.first_air_date).toLocaleDateString()}</span>
                      </div>
                      {tvShow.last_air_date && (
                        <div className="flex justify-between">
                          <span className="text-white/90">Last Air Date:</span>
                          <span>{new Date(tvShow.last_air_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/90">Status:</span>
                        <span>{tvShow.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/90">Network:</span>
                        <span>{tvShow.networks?.[0]?.name || 'Unknown'}</span>
                      </div>
                      {tvShow.number_of_seasons && (
                        <div className="flex justify-between">
                          <span className="text-white/90">Seasons:</span>
                          <span>{tvShow.number_of_seasons}</span>
                        </div>
                      )}
                      {tvShow.number_of_episodes && (
                        <div className="flex justify-between">
                          <span className="text-white/90">Episodes:</span>
                          <span>{tvShow.number_of_episodes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {tvShow.genres?.map((genre: any) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1.5 rounded-full text-sm bg-white/10 border border-white/20 text-white/90"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Creators */}
                {creators.length > 0 && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-4">Created by</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {creators.map((creator: any) => (
                        <span 
                          key={creator.id} 
                          className="px-4 py-2 bg-primary/20 rounded-full border border-primary/30 text-white/90 font-medium"
                        >
                          {creator.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cast */}
                {topCast.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-6 text-center">Cast</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {topCast.map((person: Cast) => (
                        <div key={person.id} className="text-center">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted/20 rounded-lg mb-2 flex items-center justify-center">
                              <Users size={24} className="text-white/40" />
                            </div>
                          )}
                          <h5 className="font-medium text-white text-sm line-clamp-1">{person.name}</h5>
                          <p className="text-xs text-white/60 line-clamp-1">{person.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TVShowDetail;
