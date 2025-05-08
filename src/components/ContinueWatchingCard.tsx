
import React from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Play, Info, Tv, Film } from "lucide-react"; 
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ContinueWatchingItem } from "@/components/ContinueWatchingRow";

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const title = item.title || item.name || "";

  // Fixed the posterPath handling to properly use TMDB URL
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : "/placeholder.svg";
    
  const progress = item.progress || 0;
  
  const handleContinueWatching = () => {
    if (item.type === 'tv' && item.lastEpisode) {
      navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
    } else {
      navigate(`/watch/${item.type}/${item.id}`);
    }
  };
  
  const handleGoToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${item.type}/${item.id}`);
  };

  return (
    <motion.div 
      className="overflow-hidden cursor-pointer group rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md hover:shadow-purple-400/10"
      onClick={handleContinueWatching}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-24">
        <div className="w-1/3 relative">
          <img
            src={posterPath}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
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
                handleContinueWatching();
              }}
            >
              <Play size={14} className="ml-0.5" />
            </button>
            
            <button
              className="flex items-center justify-center p-1.5 rounded-full bg-gray-500/20 hover:bg-gray-500/40 transition-colors"
              onClick={handleGoToDetail}
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
};

export default ContinueWatchingCard;
