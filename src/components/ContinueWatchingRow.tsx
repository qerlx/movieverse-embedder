
import React from "react";
import { Clock, Play } from "lucide-react"; 
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define a clearer type for the items
export interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  posterPath?: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
}

interface ContinueWatchingProps {
  items: ContinueWatchingItem[];
}

const ContinueWatchingRow: React.FC<ContinueWatchingProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="py-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
        <Clock className="mr-2 h-5 w-5 text-purple-400" />
        Continue Watching
      </h2>
      
      {/* Horizontal scrolling container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const title = item.title || item.name || "";
          const posterPath = item.poster_path || item.posterPath || null;
          const imageUrl = posterPath 
            ? `https://image.tmdb.org/t/p/w342${posterPath}`
            : "/placeholder.svg";
          const progress = item.progress || 0;

          return (
            <div key={`${item.type}-${item.id}`} className="flex-shrink-0 w-48">
              <Card className="overflow-hidden group hover:shadow-md hover:shadow-purple-400/10 transition-all bg-black/40 border-white/10">
                <Link
                  to={item.type === 'tv' && item.lastEpisode 
                    ? `/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`
                    : `/watch/${item.type}/${item.id}`
                  }
                  className="block"
                >
                  <div className="relative aspect-[16/9]">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-500/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Episode badge for TV shows */}
                    {item.type === 'tv' && item.lastEpisode && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="glass" className="text-xs backdrop-blur-sm">
                          S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress 
                          value={progress} 
                          className="h-1 w-full bg-black/50" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1 mb-1">{title}</h3>
                    {item.type === 'tv' && item.lastEpisode?.name && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        "{item.lastEpisode.name}"
                      </p>
                    )}
                  </div>
                </Link>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
