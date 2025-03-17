import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { Star, Calendar, Play, ChevronDown, AlertTriangle, Tv2, Calendar as CalendarIcon, Clock, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TVShow, Season, Episode, Cast } from "@/types";
import CategoryRow from "@/components/CategoryRow";
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

const TVShowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tvShow, setTVShow] = useState<any | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">TV Show Not Found</h2>
          <p className="text-muted-foreground mb-4">The TV show you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/tv-shows")}>Browse TV Shows</Button>
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
    <div className="min-h-screen">
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <div 
              className="w-full h-[70vh] bg-cover bg-center bg-no-repeat animate-blur-in"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-12 pb-8 min-h-[70vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full max-w-xs mx-auto md:mx-0 animate-fade-in">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="flex-1 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{tvShow.name}</h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {tvShow.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-muted/30 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" />
                    <span>{tvShow.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{firstAirYear}</span>
                </div>
                
                <div className="text-sm">
                  <span>{tvShow.number_of_seasons} Seasons</span>
                  <span className="mx-2">·</span>
                  <span>{tvShow.number_of_episodes} Episodes</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-muted-foreground">{tvShow.overview}</p>
              </div>
              
              {creators.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Created By</h2>
                  <div className="flex flex-wrap gap-2">
                    {creators.map((creator: any) => (
                      <span key={creator.id} className="text-muted-foreground">
                        {creator.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
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
                        {episode.runtime && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock size={12} className="mr-1" />
                            {episode.runtime} min
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
    </div>
  );
};

export default TVShowDetail;
