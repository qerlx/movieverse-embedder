import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '@/lib/watchService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";

interface FavoriteButtonProps {
  itemId: number;
  itemType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  itemId, 
  itemType, 
  title, 
  posterPath,
  size = 'default',
  variant = 'default'
}) => {
  const { currentUser } = useAuth();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const status = await checkIsFavorite(currentUser.uid, itemId, itemType);
        setIsFavorited(status);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFavoriteStatus();
  }, [currentUser, itemId, itemType]);
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error("Please sign in to add favorites");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFavorited) {
        await removeFromFavorites(currentUser, itemId, itemType);
        setIsFavorited(false);
        toast.success(`Removed from favorites`);
      } else {
        await addToFavorites(currentUser, {
          id: itemId, 
          type: itemType, 
          title, 
          posterPath
        });
        setIsFavorited(true);
        toast.success(`Added to favorites`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  if (size === 'icon') {
    return (
      <motion.button
        disabled={isLoading}
        onClick={handleToggleFavorite}
        className={cn(
          "flex items-center justify-center rounded-full w-9 h-9",
          isFavorited 
            ? "bg-primary/20 text-primary hover:bg-primary/30" 
            : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isFavorited ? (
            <motion.div
              key="filled"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Heart className="fill-primary text-primary" size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="outline"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Heart size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading}
      onClick={handleToggleFavorite}
      className={cn(
        isFavorited && variant === 'outline' ? "bg-primary/10" : "",
        "group"
      )}
    >
      <AnimatePresence mode="wait">
        {isFavorited ? (
          <motion.span
            key="filled-heart"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="mr-2"
          >
            <Heart className="fill-primary text-primary group-hover:scale-110 transition-transform" size={size === 'lg' ? 20 : 16} />
          </motion.span>
        ) : (
          <motion.span
            key="outline-heart"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="mr-2"
          >
            <Heart className="group-hover:scale-110 group-hover:text-primary transition-all" size={size === 'lg' ? 20 : 16} />
          </motion.span>
        )}
      </AnimatePresence>
      {isFavorited ? "Added to Favorites" : "Add to Favorites"}
    </Button>
  );
};

export default FavoriteButton;
