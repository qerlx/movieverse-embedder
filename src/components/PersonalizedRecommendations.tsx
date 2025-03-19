
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalizedRecommendations, isMovie, getItemTitle } from "@/lib/recommendationEngine";
import { Movie, TVShow } from "@/types";
import { Sparkles } from "lucide-react";

interface PersonalizedRecommendationsProps {
  limit?: number;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser) {
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const items = await getPersonalizedRecommendations(currentUser, limit);
        setRecommendations(items);
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, limit]);

  if (!currentUser || (recommendations.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex items-center mb-4">
        <Sparkles className="mr-2 text-yellow-400" size={20} />
        <h2 className="text-xl font-bold">Recommended For You</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(limit)].map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] rounded-lg bg-muted/20 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendations.map((item) => (
            <Link
              key={`${isMovie(item) ? 'movie' : 'tv'}_${item.id}`}
              to={`/${isMovie(item) ? 'movie' : 'tv'}/${item.id}`}
              className="block relative group rounded-lg overflow-hidden bg-muted/20 aspect-[2/3] animate-fade-in"
            >
              <div className="absolute inset-0 w-full h-full">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={getItemTitle(item)}
                    className="w-full h-full object-cover transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">{getItemTitle(item)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Hover content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {getItemTitle(item)}
                </h3>
                <div className="text-xs text-gray-300 mt-1">
                  {isMovie(item) ? "Movie" : "TV Show"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
