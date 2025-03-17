
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { Star, Calendar, Play, ChevronDown } from "lucide-react";
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

  useEffect(() => {
    const fetchTVShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const tvShowId = parseInt(id);
        const data = await getTVShowDetails(tvShowId);
        setTVShow(data);
        
        // Set initial selected season
        if (data.seasons && data.seasons.length > 0) {
          // Find the first actual season (some shows have season 0 for specials)
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
        const data = await getTVShowSeasonDetails(tvShowId, selectedSeason);
        
        console.log("Season details:", data);
        
        if (data.success === false) {
          setEpisodesError("Episodes are not available for this season.");
          setSeasonDetails({ episodes: [] });
        } else {
          setSeasonDetails(data);
        }
      } catch (error) {
        console.error("Error fetching season details:", error);
        setEpisodesError("Failed to load episodes. Try another season if available.");
        setSeasonDetails({ episodes: [] });
      } finally {
        setIsLoadingSeason(false);
      }
    };

    if (tvShow) {
      fetchSeasonDetails();
    }
  }, [id, selectedSeason, tvShow, toast]);

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
      {/* Hero section with backdrop */}
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
            {/* Poster */}
            <div className="w-full max-w-xs mx-auto md:mx-0 animate-fade-in">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src={posterUrl}
                  alt={tvShow.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Details */}
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

      {/* Episodes section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Episodes</h2>
          
          {tvShow.seasons && tvShow.seasons.length > 0 && (
            <div className="w-full md:w-auto">
              <Select
                value={selectedSeason.toString()}
                onValueChange={(value) => setSelectedSeason(parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[180px]">
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
                        Season {season.season_number}
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
              <div className="py-8 text-center">
                <p className="text-muted-foreground">{episodesError}</p>
                <p className="mt-2 text-sm">Try selecting a different season or check back later.</p>
              </div>
            ) : seasonDetails?.episodes?.length > 0 ? (
              <div className="space-y-4">
                {seasonDetails.episodes.map((episode: Episode) => (
                  <Collapsible key={episode.id || `ep-${episode.episode_number}`} className="bg-card rounded-lg overflow-hidden animate-fade-in">
                    <div className="flex items-center p-4">
                      <div className="w-16 h-16 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                        {episode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                            alt={episode.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Episode {episode.episode_number}
                            </div>
                            <h3 className="font-medium">{episode.name || `Episode ${episode.episode_number}`}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 gap-1"
                              onClick={() => handleWatchClick(episode.episode_number)}
                            >
                              <Play size={14} />
                              Watch
                            </Button>
                            
                            <CollapsibleTrigger className="p-2 hover:bg-muted/30 rounded-full transition-colors">
                              <ChevronDown size={16} />
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2 border-t border-border/50 ml-20">
                        <p className="text-sm text-muted-foreground">{episode.overview || "No overview available."}</p>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span>Air date: {episode.air_date || "Unknown"}</span>
                          {episode.vote_average > 0 && (
                            <>
                              <span className="mx-2">·</span>
                              <span className="flex items-center gap-1 inline-flex">
                                <Star size={12} className="text-yellow-400" />
                                <span>{episode.vote_average.toFixed(1)}/10</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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

      {/* Cast section */}
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

      {/* Similar TV shows */}
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
