
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
  const displayName = title || name || "";

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (currentUser && id) {
        try {
          const status = await checkIsFavorite(currentUser.uid, id, type);
          setIsFavorite(status);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, id, type]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error("Please sign in to manage favorites");
      return;
    }

    if (!id || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, id, type);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addToFavorites(currentUser.uid, id, type, displayName, posterPath);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    md: "h-9 px-3",
    lg: "h-11 px-4 text-lg"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (variant === "iconOnly") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full hover:bg-background/10 bg-background/5 backdrop-blur-md border border-white/10",
          "absolute right-2 top-2 z-10",
          className
        )}
        disabled={isLoading || !currentUser}
        onClick={handleToggleFavorite}
        title={isFavorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            isFavorite ? "fill-red-500 text-red-500" : "fill-none text-white"
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
        disabled={isLoading || !currentUser}
        className={className}
        title={isFavorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            "mr-2",
            isFavorite ? "fill-red-500 text-red-500" : ""
          )}
        />
        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </Button>
    );
  }
  
  if (variant === "outline") {
    return (
      <Button
        type="button"
        variant={isFavorite ? "destructive" : "outline"}
        onClick={handleToggleFavorite}
        disabled={isLoading || !currentUser}
        className={cn(sizeClasses[size], className)}
      >
        <Heart
          className={cn(
            iconSizeClasses[size],
            "mr-2",
            isFavorite ? "fill-current" : ""
          )}
        />
        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isFavorite ? "destructive" : "outline"}
      onClick={handleToggleFavorite}
      disabled={isLoading || !currentUser}
      className={cn(sizeClasses[size], className)}
    >
      <Heart
        className={cn(
          iconSizeClasses[size],
          "mr-2",
          isFavorite ? "fill-current" : ""
        )}
      />
      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
    </Button>
  );
};

export default FavoriteButton;
