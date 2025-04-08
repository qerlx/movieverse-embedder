
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '@/lib/favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  itemId: number;
  itemType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'netflix';
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
      if (!currentUser) return setIsLoading(false);
      
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
    
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      if (isFavorited) {
        await removeFromFavorites(currentUser.uid, itemId, itemType);
        setIsFavorited(false);
      } else {
        await addToFavorites(currentUser.uid, itemId, itemType, title, posterPath);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // For non-standard variants like netflix, we'll use a custom button instead
  if (variant === 'netflix') {
    return (
      <button
        disabled={isLoading || !currentUser}
        onClick={handleToggleFavorite}
        className={cn(
          "flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
          "border border-white/30 text-white hover:border-white transition-all",
          "focus:outline-none",
          size === 'lg' ? "px-8 h-11" : "px-4 h-10",
          size === 'sm' ? "px-3 h-9" : "",
          size === 'icon' ? "w-10 h-10" : "",
          isFavorited ? "bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700" : ""
        )}
      >
        <Heart 
          size={size === 'lg' ? 20 : 16} 
          className={cn(isFavorited ? "fill-white" : "")} 
        />
        {size !== 'icon' && "My List"}
      </button>
    );
  }
  
  // For standard button variants
  return (
    <Button
      variant={variant as "default" | "outline" | "ghost"}
      size={size}
      disabled={isLoading || !currentUser}
      onClick={handleToggleFavorite}
      className={cn(
        isFavorited && variant === 'outline' ? "bg-primary/10" : "",
      )}
    >
      <Heart 
        className={cn(isFavorited ? "fill-primary text-primary" : "")} 
      />
      {size !== 'icon' && (isFavorited ? "Added to Favorites" : "Add to Favorites")}
    </Button>
  );
};

export default FavoriteButton;
