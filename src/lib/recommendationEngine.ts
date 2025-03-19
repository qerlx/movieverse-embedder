
import { Movie, TVShow } from "@/types";
import { getPopularMovies, getPopularTVShows, getTrendingMovies, getTrendingTVShows } from "./api";
import { getFavorites } from "./watchService";
import { User } from "firebase/auth";

// Helper function to determine if an item is a movie
export const isMovie = (item: Movie | TVShow): item is Movie => {
  return 'title' in item;
};

// Get title of an item, handling both Movie and TVShow types
export const getItemTitle = (item: Movie | TVShow): string => {
  return isMovie(item) ? item.title : item.name;
};

// Get unique genres from favorites
const extractGenres = (favorites: any[]): number[] => {
  const genres: number[] = [];
  
  favorites.forEach(item => {
    if (item.genres) {
      item.genres.forEach((genreId: number) => {
        if (!genres.includes(genreId)) {
          genres.push(genreId);
        }
      });
    }
  });
  
  return genres;
};

// Score items based on genre preference
const scoreItems = (items: (Movie | TVShow)[], favorites: any[]): (Movie | TVShow & { score: number })[] => {
  const preferredGenres = extractGenres(favorites);
  
  // Convert favorites to a map for easy lookup
  const favoritesMap = new Map<string, number>();
  favorites.forEach(item => {
    favoritesMap.set(`${item.type}_${item.id}`, 1);
  });
  
  return items.map(item => {
    let score = 0;
    
    // Base score from popularity
    score += item.popularity / 100;
    
    // Genre match score
    const itemGenres = item.genre_ids || [];
    const genreMatchCount = itemGenres.filter(g => preferredGenres.includes(g)).length;
    score += genreMatchCount * 2;
    
    // User hasn't favorited this yet (avoid recommending already favorited content)
    const itemType = isMovie(item) ? 'movie' : 'tv';
    const key = `${itemType}_${item.id}`;
    if (!favoritesMap.has(key)) {
      score += 0.5;
    }
    
    return { ...item, score };
  });
};

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (
  currentUser: User | null,
  limit = 10
): Promise<(Movie | TVShow)[]> => {
  try {
    // If no user, return trending content
    if (!currentUser) {
      const trending = await getTrendingMovies();
      return trending.results.slice(0, limit);
    }
    
    // Get user's favorites
    const favorites = await getFavorites(currentUser);
    
    // If no favorites, return trending content
    if (!favorites || favorites.length === 0) {
      const trending = await getTrendingMovies();
      return trending.results.slice(0, limit);
    }
    
    // Count movie vs TV show preference
    const movieCount = favorites.filter(item => item.type === 'movie').length;
    const tvCount = favorites.filter(item => item.type === 'tv').length;
    
    // Fetch content based on user preference (more movies or more TV shows)
    let items: (Movie | TVShow)[] = [];
    
    if (movieCount >= tvCount) {
      // User prefers movies
      const [popularMovies, trendingMovies, popularTV] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies(),
        getPopularTVShows(),
      ]);
      
      items = [
        ...popularMovies.results, 
        ...trendingMovies.results,
        ...popularTV.results.slice(0, 5) // Just a few TV shows
      ];
    } else {
      // User prefers TV shows
      const [popularTV, trendingTV, popularMovies] = await Promise.all([
        getPopularTVShows(),
        getTrendingTVShows(),
        getPopularMovies(),
      ]);
      
      items = [
        ...popularTV.results, 
        ...trendingTV.results,
        ...popularMovies.results.slice(0, 5) // Just a few movies
      ];
    }
    
    // Score and sort items
    const scoredItems = scoreItems(items, favorites);
    const sortedItems = scoredItems.sort((a, b) => b.score - a.score);
    
    // Remove duplicates by ID
    const uniqueIds = new Set();
    const uniqueItems = sortedItems.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });
    
    return uniqueItems.slice(0, limit);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
};
