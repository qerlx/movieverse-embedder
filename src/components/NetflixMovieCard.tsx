
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { Info, Play, Plus, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NetflixMovieCardProps {
  item: Movie | TVShow;
  type: "movie" | "tv";
  className?: string;
  recentlyAdded?: boolean;
  index?: number;
}

const NetflixMovieCard: React.FC<NetflixMovieCardProps> = ({ 
  item, 
  type, 
  className,
  recentlyAdded = false,
  index = 0
}) => {
  const navigate = useNavigate();
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder.svg";
    
  const title = "title" in item ? item.title : item.name;
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${type}/${item.id}`);
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to list functionality
  };

  const cardVariants = {
    normal: { scale: 1, zIndex: 1 },
    hover: { scale: 1.1, zIndex: 10, y: -10, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" },
  };
  
  const infoVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div 
      className={cn(
        "relative aspect-[2/3] rounded-md overflow-hidden cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={cardVariants}
      animate={isHovered ? 'hover' : 'normal'}
    >
      <img 
        src={posterPath} 
        alt={title}
        className="w-full h-full object-cover transition-all"
        loading="lazy"
      />
      
      {recentlyAdded && (
        <motion.div 
          className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          New
        </motion.div>
      )}
      
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent">
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-3"
            variants={infoVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex space-x-2 mb-2" variants={itemVariants}>
              <motion.button 
                className="bg-white hover:bg-white/90 text-black rounded-full p-2 transition-all"
                onClick={handlePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={16} />
              </motion.button>
              
              <motion.button 
                className="border border-white/40 text-white hover:border-white rounded-full p-2 transition-all"
                onClick={handleAddToList}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
              </motion.button>
              
              <motion.button 
                className="border border-white/40 text-white hover:border-white rounded-full p-2 transition-all ml-auto"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThumbsUp size={16} />
              </motion.button>
            </motion.div>
            
            <motion.h3 
              className="text-sm font-bold line-clamp-1" 
              variants={itemVariants}
            >
              {title}
            </motion.h3>
            
            {item.vote_average && (
              <motion.div 
                className="text-xs text-green-500 font-semibold mt-1" 
                variants={itemVariants}
              >
                {Math.round(item.vote_average * 10)}% Match
              </motion.div>
            )}
            
            <motion.div 
              className="flex items-center gap-2 text-[10px] text-white/70 mt-1.5"
              variants={itemVariants}
            >
              {("release_date" in item && item.release_date) && (
                <span>{new Date(item.release_date).getFullYear()}</span>
              )}
              {("first_air_date" in item && item.first_air_date) && (
                <span>{new Date(item.first_air_date).getFullYear()}</span>
              )}
            </motion.div>
            
            <motion.div 
              className="text-[10px] line-clamp-2 text-white/70 mt-1"
              variants={itemVariants}
            >
              {item.overview?.substring(0, 80)}...
            </motion.div>
          </motion.div>
        </div>
      )}
      
      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div 
            className="bg-black/50 backdrop-blur-sm rounded-full p-3"
            onClick={handlePlay}
          >
            <Play size={24} className="text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NetflixMovieCard;
