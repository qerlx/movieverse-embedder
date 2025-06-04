
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Calendar, Clock, Users, Globe, ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getTVShowDetails, fetchTVShowCredits, fetchSimilarTVShows, fetchTVShowImages, getTVShowSeasonDetails } from "@/lib/api";
import type { TVShow, Season, Episode } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import CategoryRow from "@/components/CategoryRow";
import WatchProviders from "@/components/WatchProviders";
import LogoTitle from "@/components/LogoTitle";
import EpisodeSelector from "@/components/EpisodeSelector";

// Define types for the missing data structures
interface Person {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface TVShowImages {
  logos: Array<{
    file_path: string;
    iso_639_1: string | null;
  }>;
}

const TVShowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShow | null>(null);
  const [cast, setCast] = useState<Person[]>([]);
  const [similarShows, setSimilarShows] = useState<TVShow[]>([]);
  const [images, setImages] = useState<TVShowImages | null>(null);
  const [seasonsWithEpisodes, setSeasonsWithEpisodes] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    const loadShowDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [showData, creditsData, similarData, imagesData] = await Promise.all([
          getTVShowDetails(parseInt(id)),
          fetchTVShowCredits(parseInt(id)),
          fetchSimilarTVShows(parseInt(id)),
          fetchTVShowImages(parseInt(id))
        ]);
        
        setShow(showData);
        setCast(creditsData.cast.slice(0, 10));
        setSimilarShows(similarData.results.slice(0, 20));
        setImages(imagesData);

        // Load episodes for each season
        if (showData.seasons && showData.seasons.length > 0) {
          const seasonsWithEpisodesData = await Promise.all(
            showData.seasons
              .filter(season => season.season_number > 0) // Filter out specials
              .map(async (season) => {
                try {
                  const seasonData = await getTVShowSeasonDetails(parseInt(id), season.season_number);
                  if (seasonData.success && seasonData.episodes) {
                    return {
                      ...season,
                      episodes: seasonData.episodes
                    };
                  }
                  return {
                    ...season,
                    episodes: []
                  };
                } catch (error) {
                  console.error(`Error loading season ${season.season_number}:`, error);
                  return {
                    ...season,
                    episodes: []
                  };
                }
              })
          );
          setSeasonsWithEpisodes(seasonsWithEpisodesData);
        }
      } catch (error) {
        console.error("Error loading show details:", error);
        toast.error("Failed to load show details");
      } finally {
        setIsLoading(false);
      }
    };

    loadShowDetails();
  }, [id]);

  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(episodeNumber);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="w-full md:w-80 h-96 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Show not found</h1>
          <Button onClick={() => navigate("/tv-shows")}>
            Back to TV Shows
          </Button>
        </div>
      </div>
    );
  }

  const handleWatch = () => {
    navigate(`/watch/tv/${show.id}/${selectedSeason}/${selectedEpisode}`);
  };

  const backdropUrl = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : null;
    
  const posterUrl = show.poster_path 
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder.svg";

  const firstAirYear = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;
  const yearDisplay = firstAirYear?.toString() || 'TBA';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center">
        {/* Background */}
        {backdropUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <img
                    src={posterUrl}
                    alt={show.name}
                    className="w-64 md:w-80 rounded-xl shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <FavoriteButton
                      id={show.id}
                      type="tv"
                      title={show.name}
                      posterPath={show.poster_path}
                      variant="iconOnly"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 space-y-6 max-w-4xl">
                {/* Title - Use LogoTitle component with proper sizing */}
                <div className="mb-4">
                  <LogoTitle 
                    id={show.id}
                    title={show.name}
                    type="tv"
                    className="max-w-full max-h-20 sm:max-h-24 md:max-h-32 object-contain"
                    fallbackClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                  />
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {yearDisplay}
                  </Badge>
                  
                  {show.vote_average > 0 && (
                    <Badge variant="warning" className="text-sm px-3 py-1">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400" />
                      {show.vote_average.toFixed(1)}
                    </Badge>
                  )}
                  
                  {show.number_of_seasons && (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-white/20 text-white">
                      {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
                    </Badge>
                  )}

                  {show.number_of_episodes && (
                    <Badge variant="outline" className="text-sm px-3 py-1 border-white/20 text-white">
                      {show.number_of_episodes} Episodes
                    </Badge>
                  )}
                </div>

                {/* Genres */}
                {show.genres && show.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {show.genres.map((genre) => (
                      <Badge key={genre.id} variant="glass" className="text-sm">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Overview */}
                {show.overview && (
                  <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-4xl">
                    {show.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={handleWatch}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Now
                  </Button>
                  
                  <FavoriteButton
                    id={show.id}
                    type="tv"
                    title={show.name}
                    posterPath={show.poster_path}
                    variant="iconOnly"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Episodes Section */}
        {seasonsWithEpisodes && seasonsWithEpisodes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <EpisodeSelector
              seasons={seasonsWithEpisodes}
              onEpisodeSelect={handleEpisodeSelect}
              showId={show.id}
            />
          </motion.section>
        )}

        {/* Watch Providers */}
        {show.id && <WatchProviders id={show.id} type="tv" />}

        {/* Show Details Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                <Globe className="mr-2 h-6 w-6 text-primary" />
                Show Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {show.origin_country && show.origin_country.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Country</h3>
                    <p className="text-muted-foreground">
                      {show.origin_country.join(', ')}
                    </p>
                  </div>
                )}
                
                {show.original_language && (
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Original Language</h3>
                    <p className="text-muted-foreground capitalize">
                      {show.original_language}
                    </p>
                  </div>
                )}
                
                {show.first_air_date && (
                  <div>
                    <h3 className="font-semibold mb-2 text-white">First Air Date</h3>
                    <p className="text-muted-foreground">
                      {new Date(show.first_air_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {show.status && (
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Status</h3>
                    <p className="text-muted-foreground">{show.status}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Cast */}
        {cast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
              <Users className="mr-2 h-6 w-6 text-primary" />
              Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.map((person) => (
                <Card key={person.id} className="overflow-hidden hover:scale-105 transition-transform bg-black/40 border-white/10">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={person.profile_path 
                        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                        : "/placeholder.svg"
                      }
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate text-white">{person.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Similar Shows */}
        {similarShows.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <CategoryRow
              title="Similar Shows"
              items={similarShows}
              type="tv"
            />
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default TVShowDetail;
