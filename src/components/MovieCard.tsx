
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Movie, TVShow } from "@/types";

interface MovieCardProps {
  item: Movie | TVShow;
  type: "movie" | "tv";
  className?: string;
  priority?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  item,
  type,
  className,
  priority = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = "title" in item ? item.title : item.name;
  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : "/placeholder.svg";

  return (
    <Link
      to={`/${type}/${item.id}`}
      className={cn(
        "movie-card block relative group rounded-lg overflow-hidden bg-muted/20 aspect-[2/3] animate-fade-in",
        className
      )}
    >
      <div className="absolute inset-0 w-full h-full">
        <img
          src={posterUrl}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-500 lazy-image",
            !imageLoaded && "loading"
          )}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Rating badge */}
      <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1 px-2 flex items-center text-xs font-medium">
        <Star size={12} className="text-yellow-400 mr-1" />
        <span>{item.vote_average.toFixed(1)}</span>
      </div>
      
      {/* Hover content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="text-white font-medium text-sm line-clamp-1">{title}</h3>
        <div className="text-xs text-gray-300 mt-1">
          {year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
