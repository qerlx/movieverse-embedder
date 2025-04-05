
import React from "react";
import { useNavigate } from "react-router-dom";
import { Watch } from "@/types";
import { Play, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ContinueWatchingRowProps {
  items: Watch[];
}

const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ items }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 animate-fade-in">
      <h2 className={cn(
        "text-2xl font-bold mb-4",
        theme === "netflix" && "text-white",
        theme === "prime" && "text-lg uppercase tracking-wide font-medium"
      )}>
        Continue Watching for You
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
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
          
          return (
            <div key={`${item.type}-${item.id}`} className="flex flex-col">
              <div 
                className="relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer stream-card"
                onClick={handleClick}
              >
                <img 
                  src={posterPath} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="play-overlay">
                  <div className="play-button">
                    <Play size={24} />
                  </div>
                </div>
              </div>
              
              <div className="mt-1">
                <Progress 
                  value={item.progress || 5} 
                  className={cn(
                    "h-1.5 w-full",
                    theme === "netflix" && "bg-gray-800",
                    theme === "prime" && "bg-gray-700"
                  )}
                  indicatorClassName={cn(
                    theme === "netflix" && "bg-red-600",
                    theme === "prime" && "bg-blue-400"
                  )}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <button 
                  onClick={handleInfoClick}
                  className="p-2 rounded-full hover:bg-white/10"
                  aria-label="Info"
                >
                  <Info size={20} className="text-gray-300" />
                </button>
                
                {/* You could add more controls here like add to list, etc. */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
