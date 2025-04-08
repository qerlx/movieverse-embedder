
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Play, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define a clearer type for the items that can be in Continue Watching
type ContinueWatchingItem = {
  id: number;
  type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
};

interface ContinueWatchingProps {
  items: ContinueWatchingItem[];
}

const ContinueWatchingRow: React.FC<ContinueWatchingProps> = ({ items }) => {
  const navigate = useNavigate();
  
  if (!items || items.length === 0) {
    return null;
  }
  
  const handleContinueWatching = (item: ContinueWatchingItem) => {
    if (item.type === 'tv' && item.lastEpisode) {
      navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
    } else {
      navigate(`/watch/${item.type}/${item.id}`);
    }
  };
  
  const handleGoToDetail = (e: React.MouseEvent, item: ContinueWatchingItem) => {
    e.stopPropagation();
    navigate(`/${item.type}/${item.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h2 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Continue Watching</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const title = item.title || item.name || "";
          const posterPath = item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : "/placeholder.svg";
            
          const progress = item.progress || 0;
          
          return (
            <motion.div 
              key={`${item.type}-${item.id}`}
              className="relative bg-card rounded-lg overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => handleContinueWatching(item)}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <div className="flex h-28">
                <div className="w-1/3 relative">
                  <img
                    src={posterPath}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  
                  {/* Episode badge */}
                  {item.type === 'tv' && item.lastEpisode && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-medium rounded bg-primary/80 backdrop-blur-sm text-primary-foreground">
                      S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                    </div>
                  )}
                </div>
                
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
                    
                    {item.type === 'tv' && item.lastEpisode && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        S{item.lastEpisode.season} E{item.lastEpisode.episode}
                        {item.lastEpisode.name && `: ${item.lastEpisode.name}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center p-1.5 rounded-full bg-primary text-primary-foreground"
                    >
                      <Play size={16} className="fill-current" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center justify-center p-1.5 rounded-full bg-muted"
                      onClick={(e) => handleGoToDetail(e, item)}
                    >
                      <Info size={16} />
                    </motion.button>
                    
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}% completed
                    </span>
                  </div>
                </div>
              </div>
              
              <Progress value={progress} className="h-1 rounded-none bg-muted" indicatorClassName="bg-primary" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ContinueWatchingRow;
