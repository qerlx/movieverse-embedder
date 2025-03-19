
import { Movie, TVShow, MediaItem, WatchProgress } from "@/types";
import { getPopularMovies, getPopularTVShows, getTrendingMovies, getTrendingTVShows } from "./api";

// Get unique genres from watch history
const extractGenres = (watchHistory: WatchProgress[]): number[] => {
  const genres: number[] = [];
  
  watchHistory.forEach(item => {
    if (item.genres) {
      item.genres.forEach(genreId => {
        if (!genres.includes(genreId)) {
          genres.push(genreId);
        }
      });
    }
  });
  
  return genres;
};

// Score items based on genre preference and recency
const scoreItems = (items: (Movie | TVShow)[], watchHistory: WatchProgress[]): (Movie | TVShow & { score: number })[] => {
  const preferredGenres = extractGenres(watchHistory);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  // Convert watch history to a map for easy lookup
  const watchedMap = new Map<string, number>();
  watchHistory.forEach(item => {
    watchedMap.set(`${item.type}_${item.id}`, item.lastWatched);
  });
  
  return items.map(item => {
    let score = 0;
    
    // Base score from popularity
    score += item.popularity / 100;
    
    // Genre match score
    const itemGenres = item.genre_ids || [];
    const genreMatchCount = itemGenres.filter(g => preferredGenres.includes(g)).length;
    score += genreMatchCount * 2;
    
    // Recently watched bonus
    const key = `${item.title ? 'movie' : 'tv'}_${item.id}`;
    const lastWatched = watchedMap.get(key);
    if (lastWatched && lastWatched > oneWeekAgo) {
      score += 1; // Bonus for recently watched content type
    }
    
    // User hasn't watched this yet (avoid recommending already watched content)
    if (!watchedMap.has(key)) {
      score += 0.5;
    }
    
    return { ...item, score };
  });
};

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (
  watchHistory: WatchProgress[],
  limit = 10
): Promise<(Movie | TVShow)[]> => {
  try {
    // If no watch history, return trending content
    if (!watchHistory || watchHistory.length === 0) {
      const trending = await getTrendingMovies();
      return trending.results.slice(0, limit);
    }
    
    // Count movie vs TV show preference
    const movieCount = watchHistory.filter(item => item.type === 'movie').length;
    const tvCount = watchHistory.filter(item => item.type === 'tv').length;
    
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
    const scoredItems = scoreItems(items, watchHistory);
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
