
import React from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Play, Info, Clock, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define a clearer type for the items
export interface ContinueWatchingItem {
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
}

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
      <h2 className="text-xl md:text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center">
        <Clock className="mr-2 h-6 w-6 text-primary" />
        Continue Watching
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {items.map((item, idx) => {
          const title = item.title || item.name || "";
          const posterPath = item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : "/placeholder.svg";
            
          const progress = item.progress || 0;
          
          return (
            <motion.div 
              key={`${item.type}-${item.id}`}
              className="relative bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg cursor-pointer group border border-white/10"
              onClick={() => handleContinueWatching(item)}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <div className="flex h-32">
                <div className="w-1/3 relative">
                  <img
                    src={posterPath}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  
                  {/* Episode badge */}
                  {item.type === 'tv' && item.lastEpisode && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground">
                      S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                    </div>
                  )}
                </div>
                
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
                    
                    {item.type === 'tv' && item.lastEpisode && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.lastEpisode.name && `"${item.lastEpisode.name}"`}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}% completed
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center p-1.5 rounded-full bg-primary text-primary-foreground shadow-md"
                        >
                          <Play size={14} className="ml-0.5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center p-1.5 rounded-full bg-muted text-muted-foreground"
                          onClick={(e) => handleGoToDetail(e, item)}
                        >
                          <Info size={14} />
                        </motion.button>
                      </div>
                    </div>
                    
                    <Progress 
                      value={progress} 
                      className="h-1 rounded-full bg-muted" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ContinueWatchingRow;
