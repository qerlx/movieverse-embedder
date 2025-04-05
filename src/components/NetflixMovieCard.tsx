
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { Info, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetflixMovieCardProps {
  item: Movie | TVShow;
  type: "movie" | "tv";
  className?: string;
  recentlyAdded?: boolean;
}

const NetflixMovieCard: React.FC<NetflixMovieCardProps> = ({ 
  item, 
  type, 
  className,
  recentlyAdded = false
}) => {
  const navigate = useNavigate();
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder.svg";
    
  const title = "title" in item ? item.title : item.name;
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${type}/${item.id}`);
  };
  
  return (
    <div 
      className={cn(
        "relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer stream-card",
        className
      )}
      onClick={handleClick}
    >
      <img 
        src={posterPath} 
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {recentlyAdded && (
        <div className="recently-added-badge">
          Recently added
        </div>
      )}
      
      <div className="play-overlay">
        <div className="play-button" onClick={handlePlay}>
          <Play size={24} />
        </div>
      </div>
    </div>
  );
};

export default NetflixMovieCard;
