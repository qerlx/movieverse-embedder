
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchHistory } from "@/lib/watchService";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv, Clock, User, LogOut, Play } from "lucide-react";

interface WatchProgress {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name: string;
  };
  lastWatched: number;
}

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    const fetchWatchHistory = async () => {
      try {
        const history = await getWatchHistory(currentUser);
        setWatchHistory(history);
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, [currentUser, navigate]);

  const handleContinueWatching = (item: WatchProgress) => {
    if (item.type === "movie") {
      navigate(`/watch/movie/${item.id}`);
    } else if (item.type === "tv" && item.lastEpisode) {
      navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
    }
  };

  const handleNavigateToDetail = (item: WatchProgress) => {
    if (item.type === "movie") {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/tv/${item.id}`);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-primary">
            <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
            <AvatarFallback className="text-xl md:text-2xl bg-primary/20 text-primary">
              {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{currentUser.displayName}</h1>
            <p className="text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-background/50 border border-border/50">
          <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-primary/20">
            <Clock size={16} />
            All
          </TabsTrigger>
          <TabsTrigger value="movies" className="gap-2 data-[state=active]:bg-primary/20">
            <Film size={16} />
            Movies
          </TabsTrigger>
          <TabsTrigger value="tv" className="gap-2 data-[state=active]:bg-primary/20">
            <Tv size={16} />
            TV Shows
          </TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-0">
              <WatchHistoryList 
                items={watchHistory} 
                onContinueWatching={handleContinueWatching}
                onNavigateToDetail={handleNavigateToDetail}
              />
            </TabsContent>
            
            <TabsContent value="movies" className="mt-0">
              <WatchHistoryList 
                items={watchHistory.filter(item => item.type === "movie")}
                onContinueWatching={handleContinueWatching}
                onNavigateToDetail={handleNavigateToDetail}
              />
            </TabsContent>
            
            <TabsContent value="tv" className="mt-0">
              <WatchHistoryList 
                items={watchHistory.filter(item => item.type === "tv")}
                onContinueWatching={handleContinueWatching}
                onNavigateToDetail={handleNavigateToDetail}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

const WatchHistoryList = ({ 
  items, 
  onContinueWatching,
  onNavigateToDetail
}: { 
  items: WatchProgress[];
  onContinueWatching: (item: WatchProgress) => void;
  onNavigateToDetail: (item: WatchProgress) => void;
}) => {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex rounded-full bg-muted/30 p-6 mb-4">
          <Clock size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mt-4 mb-2">No watch history yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your watch history will appear here once you start watching movies or TV shows.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div 
          key={`${item.type}_${item.id}`}
          className="flex gap-4 bg-card/30 hover:bg-card/50 transition-colors p-4 rounded-lg border border-border/50"
        >
          <div 
            className="w-20 h-28 rounded-md bg-muted/30 overflow-hidden flex-shrink-0 cursor-pointer"
            onClick={() => onNavigateToDetail(item)}
          >
            {item.posterPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                {item.type === "movie" ? <Film size={24} /> : <Tv size={24} />}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div 
              className="text-lg font-medium mb-1 text-white hover:text-primary transition-colors cursor-pointer truncate"
              onClick={() => onNavigateToDetail(item)}
            >
              {item.title}
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              {item.type === "movie" ? (
                <div className="flex items-center gap-1">
                  <Film size={14} />
                  <span>Movie</span>
                  {item.progress && (
                    <span className="ml-2">{Math.round(item.progress)}% watched</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Tv size={14} />
                  <span>TV Show</span>
                  {item.lastEpisode && (
                    <span className="ml-2">
                      S{item.lastEpisode.season} E{item.lastEpisode.episode}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => onContinueWatching(item)} 
              size="sm" 
              className="gap-2"
            >
              <Play size={14} />
              {item.type === "movie" ? "Resume" : "Continue Watching"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
