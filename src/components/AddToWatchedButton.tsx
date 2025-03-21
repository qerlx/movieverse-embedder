
import React, { useState } from "react";
import { Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { toast } from "sonner";

interface AddToWatchedButtonProps {
  itemId: number;
  itemType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  genres?: number[];
}

const AddToWatchedButton: React.FC<AddToWatchedButtonProps> = ({
  itemId,
  itemType,
  title,
  posterPath,
  size = "md",
  variant = "outline",
  genres
}) => {
  const { currentUser } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size mapping
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const handleAddToWatched = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation(); // Prevent event bubbling

    if (!currentUser) {
      toast.error("Please sign in to update watch history");
      return;
    }

    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    try {
      // Add to watch history
      await addToWatchHistory(currentUser, {
        id: itemId,
        type: itemType,
        title,
        posterPath,
        progress: itemType === "movie" ? 100 : undefined,
        lastEpisode: itemType === "tv" ? {
          season: 1,
          episode: 1,
          name: "Marked as watched"
        } : undefined,
        genres
      });
      
      setIsAdded(true);
      toast.success("Added to watch history");
    } catch (error) {
      console.error("Error adding to watch history:", error);
      toast.error("Failed to update watch history");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className="gap-2"
      onClick={handleAddToWatched}
      disabled={isLoading || isAdded}
      title={isAdded ? "Added to your watch history" : "Add to watched"}
      aria-label={isAdded ? "Added to your watch history" : "Add to watched"}
    >
      {isAdded ? (
        <>
          <Check className="h-4 w-4" />
          <span>Added to Watched</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span>Add to Watched</span>
        </>
      )}
    </Button>
  );
};

export default AddToWatchedButton;
