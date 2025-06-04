
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getTVShowDetails,
  getTVShowSeasonDetails,
  fetchTVShowCredits,
  fetchSimilarTVShows,
  getConfiguration
} from "@/lib/api";
import { TVShow, Season, Episode, Cast, Video } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  Star, 
  Play, 
  Heart,
  Users,
  Info,
  Film,
  Tv
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import EpisodeSelector from "@/components/EpisodeSelector";
import WatchProviders from "@/components/WatchProviders";
import MovieCard from "@/components/MovieCard";

const TVShowDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [credits, setCredits] = useState<{ cast: Cast[]; crew: any[] } | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similar, setSimilar] = useState<TVShow[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageBaseUrl, setImageBaseUrl] = useState("https://image.tmdb.org/t/p/");

  useEffect(() => {
    const fetchTVShowData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // Get configuration for image URLs
        const config = await getConfiguration();
        setImageBaseUrl(config.images.secure_base_url);

        // Fetch TV show details
        const tvShowData = await getTVShowDetails(parseInt(id));
        console.log("TV Show Data:", tvShowData);
        setTVShow(tvShowData);

        // Set videos from the TV show data
        if (tvShowData.videos?.results) {
          setVideos(tvShowData.videos.results);
        }

        // Fetch credits
        const creditsData = await fetchTVShowCredits(parseInt(id));
        console.log("Credits Data:", creditsData);
        setCredits(creditsData);

        // Fetch similar TV shows
        const similarData = await fetchSimilarTVShows(parseInt(id));
        console.log("Similar Data:", similarData);
        if (similarData?.results) {
          setSimilar(similarData.results);
        }

        // Set the first season as selected by default
        if (tvShowData.seasons && tvShowData.seasons.length > 0) {
          const firstSeason = tvShowData.seasons.find(s => s.season_number > 0) || tvShowData.seasons[0];
          setSelectedSeason(firstSeason);
        }

      } catch (error) {
        console.error("Error fetching TV show data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVShowData();
  }, [id]);

  // Fetch episodes when selected season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || !selectedSeason) return;

      try {
        console.log(`Fetching episodes for TV show ${id}, season ${selectedSeason.season_number}`);
        const seasonData = await getTVShowSeasonDetails(parseInt(id), selectedSeason.season_number);
        console.log("Season Data:", seasonData);
        
        if (seasonData.success && seasonData.episodes) {
          setEpisodes(seasonData.episodes);
        } else {
          console.error("Failed to fetch season episodes:", seasonData.status_message);
          setEpisodes([]);
        }
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setEpisodes([]);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-16 h-16"
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </motion.div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show Not Found</h1>
          <p className="text-muted-foreground">The TV show you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path 
    ? `${imageBaseUrl}original${tvShow.backdrop_path}` 
    : null;
  
  const posterUrl = tvShow.poster_path 
    ? `${imageBaseUrl}w500${tvShow.poster_path}` 
    : null;

  const trailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube");

  const mainCast = credits?.cast?.slice(0, 10) || [];
  const director = credits?.crew?.find(person => person.job === "Executive Producer");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {backdropUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-start lg:items-end gap-8 w-full"
          >
            {/* Poster */}
            {posterUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <img 
                  src={posterUrl} 
                  alt={tvShow.name}
                  className="w-64 h-96 object-cover rounded-lg shadow-2xl border border-border/20"
                />
              </motion.div>
            )}

            {/* Details */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-2">
                  {tvShow.name}
                </h1>
                {tvShow.original_name !== tvShow.name && (
                  <p className="text-xl text-white/80 mb-4">
                    {tvShow.original_name}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 text-white/90"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4" />
                  <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                </div>
                {tvShow.number_of_episodes && (
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span>{tvShow.number_of_episodes} Episodes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{tvShow.vote_average.toFixed(1)}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {tvShow.genres && tvShow.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tvShow.genres.map(genre => (
                      <Badge key={genre.id} variant="secondary" className="text-xs">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
                  {tvShow.overview}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <a href={`/watch/tv/${tvShow.id}/1/1`}>
                    <Play className="mr-2 h-5 w-5" />
                    Watch Now
                  </a>
                </Button>
                
                {currentUser && (
                  <>
                    <FavoriteButton
                      itemId={tvShow.id}
                      itemType="tv"
                      itemTitle={tvShow.name}
                      itemPosterPath={tvShow.poster_path}
                      variant="outline"
                      size="lg"
                      className="bg-black/30 backdrop-blur-sm text-white border-white/20 hover:bg-white/10"
                    />
                    <AddToWatchedButton
                      variant="outline"
                      size="lg"
                      className="bg-black/30 backdrop-blur-sm text-white border-white/20 hover:bg-white/10"
                    />
                  </>
                )}

                {trailer && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                    className="bg-black/30 backdrop-blur-sm text-white border-white/20 hover:bg-white/10"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Trailer
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="mt-6">
            <EpisodeSelector
              tvShowId={parseInt(id!)}
              seasons={tvShow.seasons || []}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              episodes={episodes}
            />
          </TabsContent>

          <TabsContent value="cast" className="mt-6">
            <div className="space-y-6">
              {director && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Show Creator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {director.profile_path && (
                        <img 
                          src={`${imageBaseUrl}w185${director.profile_path}`}
                          alt={director.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{director.name}</h3>
                        <p className="text-sm text-muted-foreground">{director.job}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Main Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {mainCast.map(actor => (
                      <div key={actor.id} className="text-center">
                        {actor.profile_path && (
                          <img 
                            src={`${imageBaseUrl}w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full aspect-square rounded-lg object-cover mb-2"
                          />
                        )}
                        <h4 className="font-medium text-sm">{actor.name}</h4>
                        <p className="text-xs text-muted-foreground">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Show Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{tvShow.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Air Date:</span>
                    <span>{new Date(tvShow.first_air_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Seasons:</span>
                    <span>{tvShow.number_of_seasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Episodes:</span>
                    <span>{tvShow.number_of_episodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span>{tvShow.vote_average.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="uppercase">{tvShow.original_language}</span>
                  </div>
                </CardContent>
              </Card>

              <WatchProviders id={parseInt(id!)} type="tv" />
            </div>
          </TabsContent>

          <TabsContent value="similar" className="mt-6">
            {similar.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similar.slice(0, 12).map(show => (
                  <MovieCard key={show.id} item={show} type="tv" />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No similar shows found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TVShowDetail;
