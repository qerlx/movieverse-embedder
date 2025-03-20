
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const [isFavorite, setIsFavorite] = useState(false);
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
    if (isFavorite) {
      return isHovered ? "Remove from favorites" : "Added to favorites";
    }
    return "Add to favorites";
  };

  // Check if item is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser) {
        setIsFavorite(false);
        return;
      }

      try {
        const favoriteRef = doc(db, "users", currentUser.uid, "favorites", `${itemType}_${itemId}`);
        const favoriteDoc = await getDoc(favoriteRef);
        setIsFavorite(favoriteDoc.exists());
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, itemId, itemType]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      toast.error("Please sign in to add favorites");
      return;
    }

    setIsLoading(true);
    try {
      const favoriteRef = doc(db, "users", currentUser.uid, "favorites", `${itemType}_${itemId}`);

      if (isFavorite) {
        // Remove from favorites
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          itemId,
          itemType,
          title,
          posterPath,
          addedAt: Date.now()
        });
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

  return (
    <Button
      size="icon"
      variant={variant}
      className={`${sizeClass[size]} rounded-full transition-all duration-300 ${
        isFavorite 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-100/10' 
          : 'text-muted-foreground hover:text-red-400 hover:bg-red-100/10'
      } ${isHovered && isFavorite ? 'scale-110' : ''}`}
      onClick={toggleFavorite}
      disabled={isLoading}
      title={getButtonTitle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`${isFavorite ? 'fill-current' : 'fill-none'} ${
          isHovered ? 'animate-pulse' : ''
        }`} 
      />
    </Button>
  );
};

export default FavoriteButton;
