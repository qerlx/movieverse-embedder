
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTVShowDetails,
  getTVShowSeasonDetails,
  fetchTVShowCredits,
  fetchSimilarTVShows,
} from "@/lib/api";
import { Play, Star, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import CategoryRow from "@/components/CategoryRow";
import EpisodeSelector from "@/components/EpisodeSelector";
import { motion } from "framer-motion";

const TVShowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tvShow, setTVShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [showData, creditsData, similarData] = await Promise.all([
          getTVShowDetails(parseInt(id)),
          fetchTVShowCredits(parseInt(id)),
          fetchSimilarTVShows(parseInt(id))
        ]);
        
        setTVShow(showData);
        setCredits(creditsData);
        setSimilar(similarData.results || []);
        
        if (showData?.seasons && showData.seasons.length > 0) {
          const firstSeason = showData.seasons.find(s => s.season_number > 0) || showData.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (error) {
        console.error("Error fetching TV show details:", error);
        toast({
          title: "Error",
          description: "Failed to load TV show details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!id || !selectedSeason) return;
      
      try {
        const seasonData = await getTVShowSeasonDetails(parseInt(id), selectedSeason);
        if (seasonData.success !== false) {
          setSeasonDetails(seasonData);
        }
      } catch (error) {
        console.error("Error fetching season details:", error);
      }
    };

    fetchSeasonDetails();
  }, [id, selectedSeason]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
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

  const formatRuntime = (runtime?: number) => {
    if (!runtime) return "N/A";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handlePlayClick = () => {
    navigate(`/watch/tv/${id}/1/1`);
  };

  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    console.log(`Selected season ${seasonNumber}, episode ${episodeNumber}`);
    // You can add additional logic here if needed
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen"
    >
      {backdropUrl && (
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src={backdropUrl}
            alt={tvShow.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <div className="absolute top-6 left-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                <div className="lg:col-span-2">
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-4"
                  >
                    {tvShow.name}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 mb-6 text-white/90"
                  >
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-1 fill-yellow-500" />
                      <span className="font-semibold">{tvShow.vote_average.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-1" />
                      <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-1" />
                      <span>{formatRuntime(tvShow.episode_run_time?.[0])}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-1" />
                      <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-2 mb-6"
                  >
                    {tvShow.genres?.map((genre) => (
                      <Badge key={genre.id} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {genre.name}
                      </Badge>
                    ))}
                  </motion.div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    <FavoriteButton
                      id={tvShow.id}
                      type="tv"
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      variant="outline"
                      size="lg"
                      className="bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/10"
                    />
                    <AddToWatchedButton
                      itemId={tvShow.id}
                      itemType="tv"
                      title={tvShow.name}
                      posterPath={tvShow.poster_path}
                      variant="outline"
                      size="lg"
                      className="bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/10"
                    />
                  </div>
                </div>
                
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="lg:justify-self-end"
                >
                  <img
                    src={posterUrl}
                    alt={tvShow.name}
                    className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {tvShow.overview}
          </p>
        </motion.section>

        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <EpisodeSelector
            seasons={tvShow.seasons || []}
            onEpisodeSelect={handleEpisodeSelect}
            showId={tvShow.id}
          />
        </motion.section>

        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <WatchProviders id={parseInt(id!)} type="tv" />
        </motion.section>

        {credits && credits.cast && credits.cast.length > 0 && (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {credits.cast.slice(0, 12).map((person) => (
                <Card key={person.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={
                        person.profile_path
                          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                          : "/placeholder.svg"
                      }
                      alt={person.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="font-semibold text-sm line-clamp-1">{person.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {similar && similar.length > 0 && (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <CategoryRow
              title="Similar TV Shows"
              items={similar}
              type="tv"
            />
          </motion.section>
        )}
      </div>
    </motion.div>
  );
};

export default TVShowDetail;
