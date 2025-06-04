
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getTVShowDetails, 
  getTVShowSeasonDetails, 
  getTVShowCredits, 
  getTVShowVideos,
  getWatchProviders
} from "@/lib/api";
import { TVShow, Season, Episode, Cast, Video } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft,
  Info,
  Globe,
  Tv
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";

const TVShowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const fetchTVShowData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const tvShowId = parseInt(id);
        
        // Fetch main TV show details
        const [tvShowData, creditsData, videosData] = await Promise.all([
          getTVShowDetails(tvShowId),
          getTVShowCredits(tvShowId),
          getTVShowVideos(tvShowId)
        ]);
        
        setTVShow(tvShowData);
        setCast(creditsData.cast?.slice(0, 10) || []);
        setVideos(videosData.results?.filter((video: Video) => 
          video.type === 'Trailer' && video.site === 'YouTube'
        ).slice(0, 3) || []);
        
        // Set seasons and auto-select first season
        if (tvShowData.seasons && tvShowData.seasons.length > 0) {
          // Filter out season 0 (specials) and sort by season number
          const validSeasons = tvShowData.seasons
            .filter((season: Season) => season.season_number > 0)
            .sort((a: Season, b: Season) => a.season_number - b.season_number);
          
          setSeasons(validSeasons);
          
          if (validSeasons.length > 0) {
            setSelectedSeason(validSeasons[0]);
            // Fetch episodes for first season
            fetchSeasonEpisodes(tvShowId, validSeasons[0].season_number);
          }
        }
        
      } catch (error) {
        console.error("Error fetching TV show details:", error);
        toast.error("Failed to load TV show details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVShowData();
  }, [id]);

  const fetchSeasonEpisodes = async (tvShowId: number, seasonNumber: number) => {
    try {
      setLoadingEpisodes(true);
      const seasonData = await getTVShowSeasonDetails(tvShowId, seasonNumber);
      
      if (seasonData && seasonData.episodes) {
        // Map episodes to ensure runtime is optional
        const mappedEpisodes = seasonData.episodes.map((episode: any) => ({
          ...episode,
          runtime: episode.runtime || undefined // Make runtime optional
        }));
        setEpisodes(mappedEpisodes);
      } else {
        setEpisodes([]);
      }
    } catch (error) {
      console.error("Error fetching season episodes:", error);
      toast.error("Failed to load episodes");
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleSeasonChange = (season: Season) => {
    if (!tvShow) return;
    
    setSelectedSeason(season);
    fetchSeasonEpisodes(tvShow.id, season.season_number);
  };

  const handleWatchEpisode = (episode: Episode) => {
    if (!tvShow || !selectedSeason) return;
    navigate(`/watch/tv/${tvShow.id}/${selectedSeason.season_number}/${episode.episode_number}`);
  };

  const handleWatchShow = () => {
    if (!tvShow || !selectedSeason || episodes.length === 0) return;
    // Start with first episode of selected season
    navigate(`/watch/tv/${tvShow.id}/${selectedSeason.season_number}/1`);
  };

  if (isLoading || !tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
    : null;

  const posterUrl = tvShow.poster_path 
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : "/placeholder.svg";

  const trailer = videos.find(video => video.type === 'Trailer');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {backdropUrl && (
          <div 
            className="w-full h-[70vh] bg-cover bg-center relative"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </div>
        )}
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex flex-col lg:flex-row gap-8 items-end">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-shrink-0"
              >
                <img
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                />
              </motion.div>
              
              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 text-white"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="mb-4 text-white hover:bg-white/20"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-shadow">
                  {tvShow.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="text-lg font-semibold">
                      {tvShow.vote_average.toFixed(1)}
                    </span>
                  </div>
                  
                  {tvShow.first_air_date && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                    </div>
                  )}
                  
                  {tvShow.number_of_seasons && (
                    <div className="flex items-center gap-2">
                      <Tv size={16} />
                      <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {tvShow.status && (
                    <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                      {tvShow.status}
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg mb-8 max-w-3xl leading-relaxed text-gray-200">
                  {tvShow.overview}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={handleWatchShow}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-full"
                  >
                    <Play size={20} className="mr-2 fill-white" />
                    Watch Now
                  </Button>
                  
                  <FavoriteButton
                    id={tvShow.id}
                    type="tv"
                    name={tvShow.name}
                    posterPath={tvShow.poster_path}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-8 py-3"
                  />
                  
                  <AddToWatchedButton
                    id={tvShow.id}
                    type="tv"
                    title={tvShow.name}
                    posterPath={tvShow.poster_path}
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-full px-8 py-3"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="watch">Watch Options</TabsTrigger>
          </TabsList>
          
          {/* Episodes Tab */}
          <TabsContent value="episodes" className="space-y-6">
            {/* Season Selector */}
            {seasons.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {seasons.map((season) => (
                  <Button
                    key={season.id}
                    variant={selectedSeason?.id === season.id ? "default" : "outline"}
                    onClick={() => handleSeasonChange(season)}
                    className="rounded-full"
                  >
                    Season {season.season_number}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Episodes Grid */}
            {loadingEpisodes ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid gap-4">
                {episodes.map((episode, index) => (
                  <Card key={episode.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative flex-shrink-0">
                          <img
                            src={episode.still_path 
                              ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                              : "/placeholder.svg"
                            }
                            alt={episode.name}
                            className="w-full sm:w-48 h-32 object-cover"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleWatchEpisode(episode)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full"
                          >
                            <Play size={16} className="fill-white" />
                          </Button>
                        </div>
                        
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">
                              {episode.episode_number}. {episode.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {episode.runtime && (
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{episode.runtime}min</span>
                                </div>
                              )}
                              {episode.vote_average > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                  <span>{episode.vote_average.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {episode.air_date && new Date(episode.air_date).toLocaleDateString()}
                          </p>
                          
                          <p className="text-sm leading-relaxed">
                            {episode.overview || "No description available."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No episodes available for this season.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info size={20} />
                    Show Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-muted-foreground leading-relaxed">{tvShow.overview}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">First Air Date</h4>
                      <p className="text-muted-foreground">
                        {tvShow.first_air_date ? new Date(tvShow.first_air_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Status</h4>
                      <p className="text-muted-foreground">{tvShow.status || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Seasons</h4>
                      <p className="text-muted-foreground">{tvShow.number_of_seasons || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Episodes</h4>
                      <p className="text-muted-foreground">{tvShow.number_of_episodes || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {tvShow.genres && tvShow.genres.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {tvShow.genres.map((genre) => (
                          <Badge key={genre.id} variant="secondary">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {tvShow.origin_country && tvShow.origin_country.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Origin Country</h4>
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <span className="text-muted-foreground">
                          {tvShow.origin_country.join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Videos & Trailers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {videos.map((video) => (
                        <div key={video.id} className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.key}`}
                            title={video.name}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Cast Tab */}
          <TabsContent value="cast">
            {cast.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cast.map((member) => (
                  <Card key={member.id} className="text-center">
                    <CardContent className="p-4">
                      <img
                        src={member.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                          : "/placeholder.svg"
                        }
                        alt={member.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-sm mb-1">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.character}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cast information available.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Watch Options Tab */}
          <TabsContent value="watch">
            <Card>
              <CardContent className="p-6">
                <WatchProviders id={tvShow.id} type="tv" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TVShowDetail;
