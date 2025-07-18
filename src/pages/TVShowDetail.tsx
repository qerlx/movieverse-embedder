
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
      {/* Hero Section with Backdrop */}
      <div className="relative min-h-screen">
        {backdropUrl && (
          <div className="absolute inset-0">
            <motion.div 
              initial={{ filter: "blur(20px)", opacity: 0, scale: 1.1 }}
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            {/* Blue gradient overlay to match reference */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/80 to-blue-600/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-6 pt-20 pb-12">
          {/* Navigation Tabs */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Tabs defaultValue="episodes" className="w-full">
              <TabsList className="bg-white/10 border border-white/20 backdrop-blur-md rounded-full p-1">
                <TabsTrigger 
                  value="episodes" 
                  className="rounded-full px-6 py-2 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  Episodes
                </TabsTrigger>
                <TabsTrigger 
                  value="similar" 
                  className="rounded-full px-6 py-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  You May Also Like
                </TabsTrigger>
                <TabsTrigger 
                  value="extras" 
                  className="rounded-full px-6 py-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  Extras
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="rounded-full px-6 py-2 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  About
                </TabsTrigger>
              </TabsList>

              {/* Hero Content - Title and Play Button */}
              <div className="flex flex-col items-center justify-center text-center py-20">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  {/* Show Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                    {tvShow.name}
                  </h1>
                  
                  {/* Subtitle/Tagline */}
                  {tvShow.tagline && (
                    <p className="text-xl md:text-2xl text-white/90 font-light mb-6">
                      {tvShow.tagline}
                    </p>
                  )}
                </motion.div>

                {/* Large Play Button */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-8"
                >
                  <Button
                    onClick={() => handleWatchClick()}
                    className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110"
                    size="icon"
                  >
                    <Play size={32} className="text-white ml-1" fill="white" />
                  </Button>
                </motion.div>

                {/* Resume Watching / Episode Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center mb-8"
                >
                  <p className="text-white/80 text-sm uppercase tracking-wide mb-2">
                    NEW SERIES NOW STREAMING
                  </p>
                  <div className="flex items-center justify-center gap-4 text-white/70">
                    {tvShow.number_of_seasons && (
                      <span className="flex items-center gap-1">
                        <Tv size={16} />
                        {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}
                      </span>
                    )}
                    {tvShow.vote_average > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400" fill="currentColor" />
                        {tvShow.vote_average.toFixed(1)}
                      </span>
                    )}
                    <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                  </div>
                </motion.div>

                {/* Cast Information */}
                {topCast.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center"
                  >
                    <p className="text-white/60 text-sm">
                      Starring: {topCast.slice(0, 4).map(actor => actor.name).join(', ')}
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="flex items-center gap-4 mt-8"
                >
                  {currentUser && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
                      >
                        <Heart size={20} className="text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
                      >
                        <Plus size={20} className="text-white" />
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>

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
                <div className="text-center py-12">
                  <p className="text-white/60">Similar shows will be displayed here</p>
                </div>
              </TabsContent>

              <TabsContent value="extras" className="mt-8">
                <div className="text-center py-12">
                  <p className="text-white/60">Extras and behind-the-scenes content</p>
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

                  {/* Show Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Show Details</h4>
                      <div className="space-y-2 text-white/70">
                        <p><span className="text-white/90">First Air Date:</span> {new Date(tvShow.first_air_date).toLocaleDateString()}</p>
                        {tvShow.last_air_date && (
                          <p><span className="text-white/90">Last Air Date:</span> {new Date(tvShow.last_air_date).toLocaleDateString()}</p>
                        )}
                        <p><span className="text-white/90">Status:</span> {tvShow.status}</p>
                        <p><span className="text-white/90">Network:</span> {tvShow.networks?.[0]?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {tvShow.genres?.map((genre: any) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/20 text-white/90"
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
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TVShowDetail;
