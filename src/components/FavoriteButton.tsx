
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToFavorites, removeFromFavorites, checkIsFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavoriteButtonProps {
  id: number;
  type: "movie" | "tv";
  title?: string;
  name?: string;
  posterPath?: string;
  variant?: "default" | "icon" | "iconOnly" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  id,
  type,
  title,
  name,
  posterPath,
  variant = "default",
  size = "md",
  className
}) => {
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const displayName = title || name || "";

  // Local storage key for client-side caching
  const localStorageKey = `favorite_${currentUser?.uid}_${type}_${id}`;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsFavorite(false);
        setIsInitialized(true);
        return;
      }

      // First check local storage for immediate response
      const localFavorite = localStorage.getItem(localStorageKey);
      if (localFavorite !== null) {
        setIsFavorite(localFavorite === 'true');
      }

      setIsLoading(true);
      try {
        const status = await checkIsFavorite(currentUser.uid, id, type);
        setIsFavorite(status);
        // Update local storage
        localStorage.setItem(localStorageKey, status.toString());
      } catch (error) {
        console.error("Error checking favorite status:", error);
        // Keep local storage value if API fails
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, id, type, localStorageKey]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error("Please sign in to add favorites");
      return;
    }
    
    // Optimistic update
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    localStorage.setItem(localStorageKey, newFavoriteState.toString());
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, id, type);
        toast.success(`Removed ${displayName} from favorites`);
      } else {
        await addToFavorites(currentUser.uid, id, type, displayName, posterPath);
        toast.success(`Added ${displayName} to favorites`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert optimistic update on error
      setIsFavorite(!newFavoriteState);
      localStorage.setItem(localStorageKey, (!newFavoriteState).toString());
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-4 h-4"
  };

  if (variant === "iconOnly") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full hover:bg-white/10 bg-black/20 backdrop-blur-md border border-white/20 transition-all duration-200 shadow-lg",
          "hover:scale-105 active:scale-95",
          isLoading && "animate-pulse",
          className
        )}
        disabled={isLoading || !isInitialized}
        onClick={handleToggleFavorite}
        title={isFavorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            "transition-all duration-200",
            isFavorite ? "fill-red-500 text-red-500 scale-110" : "fill-none text-white hover:text-red-400"
          )}
        />
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={handleToggleFavorite}
        disabled={isLoading || !isInitialized}
        className={cn(sizeClasses[size], className)}
        title={isFavorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            "mr-2 transition-colors duration-200",
            isFavorite ? "fill-red-500 text-red-500" : "text-white/70"
          )}
        />
        {isFavorite ? "Remove" : "Add to Favorites"}
      </Button>
    );
  }
  
  if (variant === "outline") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleToggleFavorite}
        disabled={isLoading || !isInitialized}
        className={cn(
          sizeClasses[size], 
          "border-white/20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white hover:text-white transition-all duration-200",
          isFavorite && "border-red-500/50 bg-red-500/10 hover:bg-red-500/20",
          className
        )}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            "mr-2 transition-all duration-200",
            isFavorite ? "fill-red-500 text-red-500" : "text-white/70"
          )}
        />
        {isFavorite ? "Remove" : "Add to Favorites"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isFavorite ? "destructive" : "outline"}
      onClick={handleToggleFavorite}
      disabled={isLoading || !currentUser || !isInitialized}
      className={cn(
        sizeClasses[size], 
        "transition-all duration-200 hover:scale-105 active:scale-95",
        isLoading && "animate-pulse",
        !isFavorite && "border-white/20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white hover:text-white",
        className
      )}
    >
      <Heart
        className={cn(
          iconSizeClasses[size],
          "mr-2 transition-all duration-200",
          isFavorite ? "fill-current" : "text-white/70"
        )}
      />
      {isFavorite ? "Remove" : "Add to Favorites"}
    </Button>
  );
};

export default FavoriteButton;
