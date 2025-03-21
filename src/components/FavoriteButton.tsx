
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isFavorite, addToFavorites, removeFromFavorites } from "@/lib/watchService";
import { toast } from "sonner";

interface FavoriteButtonProps {
  itemId: number;
  itemType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  title,
  posterPath,
  size = "md",
  variant = "outline"
}) => {
  const { currentUser } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Size mapping
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  // Tooltips based on state
  const getButtonTitle = () => {
    if (isFavorited) {
      return isHovered ? "Remove from favorites" : "Added to favorites";
    }
    return "Add to favorites";
  };

  // Check if item is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsFavorited(false);
        return;
      }

      try {
        const status = await isFavorite(currentUser, itemType, itemId);
        setIsFavorited(status);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, itemId, itemType]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation(); // Prevent event bubbling

    if (!currentUser) {
      toast.error("Please sign in to add favorites");
      return;
    }

    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFromFavorites(currentUser, itemType, itemId);
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await addToFavorites(currentUser, {
          id: itemId,
          type: itemType,
          title,
          posterPath
        });
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant={variant}
      className={`${sizeClass[size]} rounded-full transition-all duration-300 ${
        isFavorited 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-100/10' 
          : 'text-muted-foreground hover:text-red-400 hover:bg-red-100/10'
      } ${isHovered && isFavorited ? 'scale-110' : ''}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={getButtonTitle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`${isFavorited ? 'fill-current' : ''} ${
          isLoading ? 'animate-pulse' : (isHovered ? 'animate-pulse' : '')
        }`} 
      />
    </Button>
  );
};

export default FavoriteButton;
