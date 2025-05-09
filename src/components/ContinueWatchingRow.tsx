
import React from "react";
import { Clock } from "lucide-react"; 
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
        <Clock className="mr-2 h-5 w-5 text-purple-400" />
        Continue Watching
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {items.map((item) => {
            const title = item.title || item.name || "";
            // Ensure we're using the correct poster path property
            const posterPath = item.poster_path || item.posterPath || null;
            const imageUrl = posterPath 
              ? `https://image.tmdb.org/t/p/w342${posterPath}`
              : "/placeholder.svg";
            const progress = item.progress || 0;

            return (
              <CarouselItem key={`${item.type}-${item.id}`} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                <Card className="overflow-hidden group hover:shadow-md hover:shadow-purple-400/10 transition-all">
                  <Link
                    to={item.type === 'tv' && item.lastEpisode 
                      ? `/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`
                      : `/watch/${item.type}/${item.id}`
                    }
                    className="block"
                  >
                    <div className="relative aspect-[2/3]">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      
                      {/* Episode badge */}
                      {item.type === 'tv' && item.lastEpisode && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-md bg-purple-500/80 backdrop-blur-sm text-white">
                          S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center transition-opacity p-4">
                        <div className="text-center">
                          <span className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full">
                            Resume
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    {progress > 0 && (
                      <Progress 
                        value={progress} 
                        className="h-1 w-full bg-gray-200 dark:bg-gray-700" 
                      />
                    )}
                  </Link>
                  
                  <CardContent className="p-2">
                    <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
                    {item.type === 'tv' && item.lastEpisode?.name && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        "{item.lastEpisode.name}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <div className="hidden md:flex items-center justify-end space-x-2 mt-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default ContinueWatchingRow;
