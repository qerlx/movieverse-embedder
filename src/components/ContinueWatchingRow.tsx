
import React from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Play, Info, Clock, SkipForward, Tv, Film } from "lucide-react"; 
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
  
  // Fixed variants objects to resolve TS errors
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // Reduced for less lag
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Reduced y value for less lag
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
        <Clock className="mr-2 h-5 w-5 text-purple-400" />
        Continue Watching
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {items.map((item, idx) => {
          const title = item.title || item.name || "";
          // Fixed the posterPath handling to properly use TMDB URL
          const posterPath = item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : "/placeholder.svg";
            
          const progress = item.progress || 0;
          
          return (
            <motion.div 
              key={`${item.type}-${item.id}`}
              className="overflow-hidden cursor-pointer group rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md hover:shadow-purple-400/10"
              onClick={() => handleContinueWatching(item)}
              variants={itemVariants}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-24">
                <div className="w-1/3 relative">
                  <img
                    src={posterPath}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  
                  {/* Media type indicator */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm flex items-center">
                    {item.type === 'tv' ? (
                      <Tv size={12} className="text-purple-400 mr-1" />
                    ) : (
                      <Film size={12} className="text-purple-400 mr-1" />
                    )}
                    <span className="text-[10px] font-medium text-white">
                      {item.type === 'tv' ? 'TV' : 'Movie'}
                    </span>
                  </div>
                  
                  {/* Episode badge */}
                  {item.type === 'tv' && item.lastEpisode && (
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/70 backdrop-blur-sm text-white">
                      S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
                    <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                      <Play className="ml-0.5 w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="w-2/3 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
                    
                    {item.type === 'tv' && item.lastEpisode && item.lastEpisode.name && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        "{item.lastEpisode.name}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="flex items-center justify-center p-1.5 rounded-full bg-purple-500/90 text-white shadow-sm hover:bg-purple-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueWatching(item);
                      }}
                    >
                      <Play size={14} className="ml-0.5" />
                    </button>
                    
                    <button
                      className="flex items-center justify-center p-1.5 rounded-full bg-gray-500/20 hover:bg-gray-500/40 transition-colors"
                      onClick={(e) => handleGoToDetail(e, item)}
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Progress bar at the bottom */}
              <Progress 
                value={progress} 
                className="h-1 rounded-none bg-gray-200 dark:bg-gray-800" 
                indicatorClassName="bg-gradient-to-r from-purple-600 to-purple-400"
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ContinueWatchingRow;
