
import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WatchItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
  lastWatched: string;
}

interface ContinueWatchingRowProps {
  items: WatchItem[];
}

const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ items }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  if (items.length === 0) {
    return null;
  }

  const isNetflix = theme === 'netflix';

  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={cn(
        "text-2xl font-bold mb-4",
        isNetflix ? "text-white" : "text-foreground"
      )}>
        Continue Watching for You
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
        {items.map((item, index) => {
          const posterPath = item.posterPath 
            ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
            : "/placeholder.svg";
            
          const handleClick = () => {
            if (item.type === "movie") {
              navigate(`/watch/movie/${item.id}`);
            } else if (item.type === "tv" && item.lastEpisode) {
              navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
            }
          };
          
          const handleInfoClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            navigate(`/${item.type}/${item.id}`);
          };

          // Episode info display
          const episodeInfo = item.type === "tv" && item.lastEpisode ? 
            `S${item.lastEpisode.season}:E${item.lastEpisode.episode}${item.lastEpisode.name ? ` - ${item.lastEpisode.name}` : ''}` : 
            '';
          
          return (
            <motion.div 
              key={`${item.type}-${item.id}`} 
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div 
                className={cn(
                  "relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer group",
                  isNetflix ? "hover:scale-105" : "hover:shadow-lg"
                )}
                onClick={handleClick}
              >
                <motion.img 
                  src={posterPath} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end",
                  "p-3"
                )}>
                  <div className="w-full">
                    {episodeInfo && (
                      <div className={cn(
                        "text-xs mb-2 font-medium",
                        isNetflix ? "text-gray-300" : "text-gray-200"
                      )}>
                        {episodeInfo}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <motion.div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isNetflix ? "bg-white text-black" : "bg-primary text-white"
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={18} />
                      </motion.div>
                      
                      <motion.div
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/50 text-white"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInfoClick}
                      >
                        <Info size={16} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-1">
                <Progress 
                  value={item.progress || 5} 
                  className={cn(
                    "h-1.5 w-full",
                    isNetflix ? "bg-gray-800" : "bg-secondary"
                  )}
                  indicatorClassName={isNetflix ? "bg-red-600" : undefined}
                />
              </div>
              
              <div className="mt-2 px-1">
                <h3 className={cn(
                  "text-sm font-medium line-clamp-1",
                  isNetflix ? "text-gray-300" : "text-foreground"
                )}>
                  {item.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ContinueWatchingRow;
