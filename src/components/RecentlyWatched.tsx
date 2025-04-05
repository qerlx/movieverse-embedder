
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentlyWatched } from "@/lib/watchService";
import { Link } from "react-router-dom";
import { Clock, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentlyWatchedProps {
  limit?: number;
}

const RecentlyWatched: React.FC<RecentlyWatchedProps> = ({ limit = 0 }) => {
  const { currentUser } = useAuth();
  const [watchedItems, setWatchedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      if (!currentUser) {
        setWatchedItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const items = await getRecentlyWatched(currentUser, limit > 0 ? limit : 6);
        setWatchedItems(items);
      } catch (error) {
        console.error("Error fetching recently watched:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [currentUser, limit]);

  if (!currentUser || (watchedItems.length === 0 && !isLoading)) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto mb-4 text-muted" size={40} />
        <h3 className="text-lg font-medium mb-2">No watch history yet</h3>
        <p className="text-muted-foreground">
          Start watching movies and TV shows to see them here
        </p>
        <Button className="mt-4" asChild>
          <Link to="/">Browse Content</Link>
        </Button>
      </div>
    );
  }

  const isNetflix = theme === 'netflix';
  const isPrime = theme === 'prime';

  // Section title based on theme
  const getSectionTitle = () => {
    if (isNetflix) {
      return <h2 className="section-header mb-3">Continue Watching</h2>;
    }
    if (isPrime) {
      return <h2 className="section-header mb-2">CONTINUE WATCHING</h2>;
    }
    return <h2 className="text-xl font-medium mb-4">Continue Watching</h2>;
  };

  return (
    <div>
      {getSectionTitle()}
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(limit > 0 ? limit : 6)].map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] rounded-lg bg-muted/20 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <ScrollArea className={`w-full ${(isNetflix || isPrime) ? 'overflow-x-auto' : ''}`}>
          <div className={`${(isNetflix || isPrime) ? 'flex space-x-4 pb-4' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'}`}>
            {watchedItems.map((item) => (
              <Link
                key={`${item.type}_${item.id}`}
                to={item.type === 'movie' 
                  ? `/watch/${item.type}/${item.id}`
                  : `/watch/${item.type}/${item.id}/${item.lastEpisode?.season || 1}/${item.lastEpisode?.episode || 1}`
                }
                className={`${(isNetflix || isPrime) 
                  ? 'flex-shrink-0 w-[180px]' 
                  : 'block'} 
                  relative group rounded-lg overflow-hidden bg-muted/20 aspect-[2/3] stream-card animate-fade-in`}
              >
                <div className="absolute inset-0 w-full h-full">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Episode info for TV shows */}
                {item.type === "tv" && item.lastEpisode && (
                  <div className={`absolute top-2 left-2 ${isNetflix ? 'bg-black/30 backdrop-blur-sm rounded px-1' : ''}`}>
                    <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 ${isNetflix ? 'bg-transparent' : ''}`}>
                      S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                    </Badge>
                  </div>
                )}

                {/* Netflix style UI */}
                {isNetflix && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-2">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    {/* Progress bar for Netflix */}
                    <div className="mt-2 w-full bg-white/30 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{width: `${item.progress || 15}%`}}
                      />
                    </div>
                  </div>
                )}
                
                {/* Prime Video style UI */}
                {isPrime && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a242f] via-[#1a242f]/90 to-transparent p-2">
                    <div className="truncate text-xs font-medium uppercase tracking-wide">{item.title}</div>
                    {/* Progress bar for Prime */}
                    <div className="mt-1.5 w-full bg-white/20 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{width: `${item.progress || 15}%`}}
                      />
                    </div>
                  </div>
                )}
                
                {/* Default UI */}
                {!isNetflix && !isPrime && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="text-white font-medium text-sm line-clamp-1">{item.title}</div>
                    
                    <div className="mt-2 flex items-center">
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="gap-1 py-1 px-3 text-xs h-7"
                      >
                        <Play className="h-3 w-3" />
                        Resume
                      </Button>
                      
                      <div className="text-xs text-gray-300 ml-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.lastWatched).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default RecentlyWatched;
