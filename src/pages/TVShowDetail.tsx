import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  getTVShowDetails,
  getTVShowEpisodes,
  getVidoraTVEmbedUrl,
  getWatchProviders,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import FavoriteButton from "@/components/FavoriteButton";
import {
  CalendarIcon,
  TvIcon,
  Clapperboard,
  Link2,
  ExternalLink,
  PlayIcon,
  Eye,
} from "lucide-react";

const TVShowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [tvShow, setTVShow] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [watchProviders, setWatchProviders] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [isEmbedLoading, setIsEmbedLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Watch progress (0 to 100)
  const [isMuted, setIsMuted] = useState(true); // Mute state
  const [isPlaying, setIsPlaying] = useState(false); // Play state

  useEffect(() => {
    const loadTVShowDetails = async () => {
      if (!id) {
        toast.error("TV Show ID is missing.");
        return;
      }

      try {
        const tvShowId = parseInt(id, 10);
        const tvShowDetails = await getTVShowDetails(tvShowId);
        setTVShow(tvShowDetails);

        // Load watch providers
        try {
          const providers = await getWatchProviders("tv", tvShowId);
          setWatchProviders(providers.results);
        } catch (error) {
          console.error("Error fetching watch providers:", error);
        }
      } catch (error) {
        console.error("Error fetching TV show details:", error);
        toast.error("Failed to load TV show details.");
      }
    };

    loadTVShowDetails();
  }, [id]);

  useEffect(() => {
    const loadEpisodes = async () => {
      if (!id) return;

      try {
        const tvShowId = parseInt(id, 10);
        const episodeData = await getTVShowEpisodes(tvShowId, selectedSeason);
        setEpisodes(episodeData.episodes);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        toast.error("Failed to load episodes for the selected season.");
      }
    };

    loadEpisodes();
  }, [id, selectedSeason]);

  // Function to handle episode selection and open the dialog
  const handleEpisodeClick = (episode: any) => {
    setSelectedEpisode(episode);
    setIsDialogOpen(true);
  };

  // Function to close the dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEpisode(null);
    setEmbedUrl(null);
  };

  // Function to load the embed URL
  const loadEmbedUrl = async (episode: any) => {
    if (!tvShow || !episode) return;

    setIsEmbedLoading(true);
    try {
      const tvShowId = parseInt(id || "", 10);
      const url = getVidoraTVEmbedUrl(tvShowId, selectedSeason, episode.episode_number, {
        autoplay: true,
        autonextepisode: true,
      });
      setEmbedUrl(url);

      // Save to watch history
      if (currentUser) {
        try {
          await addToWatchHistory(currentUser, {
            id: tvShowId,
            type: "tv",
            title: tvShow.name,
            posterPath: tvShow.poster_path,
            lastEpisode: {
              season: selectedSeason,
              episode: episode.episode_number,
              name: episode.name,
            },
            progress: progress,
          });
        } catch (error) {
          console.error("Error saving to watch history:", error);
        }
      }
    } catch (error) {
      console.error("Error generating embed URL:", error);
      toast.error("Failed to load episode. Please try again later.");
    } finally {
      setIsEmbedLoading(false);
    }
  };

  // Function to handle "Watch Episode" button click
  const handleWatchEpisode = (episode: any) => {
    loadEmbedUrl(episode);
    handleEpisodeClick(episode);
  };

  // Function to handle season change
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(parseInt(e.target.value, 10));
  };

  // Function to handle progress change
  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };

  // Function to toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Function to toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading TV Show details...
      </div>
    );
  }

  const numberOfSeasons = tvShow.number_of_seasons;

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-6 pb-16"
      >
        {/* TV Show Header */}
        <div className="relative">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {tvShow.backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w1280${tvShow.backdrop_path}`}
                alt={tvShow.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <TvIcon className="h-16 w-16 text-gray-500" />
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-10">
            {currentUser && (
              <FavoriteButton
                id={tvShow.id}
                type="tv"
                title={tvShow.name}
                posterPath={tvShow.poster_path}
                variant="rounded"
              />
            )}
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              {tvShow.name}
            </h1>
          </div>
        </div>

        {/* TV Show Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Poster and Quick Info */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10">
              {tvShow.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                  alt={tvShow.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <TvIcon className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Quick Info</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <TvIcon className="w-3 h-3 mr-1" />
                  {tvShow.number_of_seasons} Seasons
                </Badge>
                <Badge variant="secondary">
                  <Clapperboard className="w-3 h-3 mr-1" />
                  {tvShow.number_of_episodes} Episodes
                </Badge>
                {tvShow.first_air_date && (
                  <Badge variant="secondary">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {tvShow.first_air_date.split("-")[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Overview and Episodes */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-2">Overview</h2>
            <p className="text-muted-foreground">{tvShow.overview}</p>

            {/* Watch Providers */}
            {watchProviders && Object.keys(watchProviders).length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Where to Watch</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(watchProviders).map(([key, value]: [string, any]) => {
                    return (
                      <div key={key}>
                        <h3 className="font-medium">{key}</h3>
                        <div className="flex flex-wrap gap-2">
                          {value.map((provider: any) => (
                            <a
                              key={provider.provider_id}
                              href={provider.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-md border border-white/10 hover:border-white/30 transition-colors p-2"
                            >
                              {provider.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                  alt={provider.provider_name}
                                  className="h-6 w-auto"
                                />
                              ) : (
                                <span>{provider.provider_name}</span>
                              )}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Episodes Section */}
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Episodes</h2>
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="season" className="font-medium">
                  Select Season:
                </label>
                <select
                  id="season"
                  className="bg-black/40 border border-white/10 rounded-md px-4 py-2"
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                >
                  {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map(
                    (season) => (
                      <option key={season} value={season}>
                        Season {season}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Episode List */}
              <ScrollArea className="rounded-md border border-white/10 h-[300px]">
                <div className="grid grid-cols-1 gap-2 p-3">
                  {episodes.map((episode) => (
                    <Button
                      key={episode.id}
                      variant="ghost"
                      className="w-full justify-start rounded-md hover:bg-white/5"
                      onClick={() => handleWatchEpisode(episode)}
                    >
                      <span className="w-8 text-right mr-4 text-muted-foreground">
                        {episode.episode_number}.
                      </span>
                      <span className="truncate">{episode.name}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Episode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
          <DialogHeader>
            <DialogTitle>
              {tvShow.name} - Season {selectedSeason}, Episode{" "}
              {selectedEpisode?.episode_number}
            </DialogTitle>
            <DialogDescription>{selectedEpisode?.name}</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Episode Player"
                width="100%"
                height="100%"
                allowFullScreen
                className="border-none"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isEmbedLoading ? (
                  <p>Loading episode...</p>
                ) : (
                  <p>Episode will load here</p>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={togglePlay}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </Button>
              <Button variant="outline" size="icon" onClick={toggleMute}>
                {isMuted ? <Volume2Icon /> : <VolumeXIcon />}
              </Button>
              <Slider
                defaultValue={[progress]}
                max={100}
                step={1}
                onValueChange={handleProgressChange}
                aria-label="Video progress"
                className="w-32 md:w-64"
              />
            </div>
            <Button variant="primary" onClick={handleDialogClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TVShowDetail;

// Icons
import {
  PlayIcon,
  PauseIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
} from "lucide-react";
