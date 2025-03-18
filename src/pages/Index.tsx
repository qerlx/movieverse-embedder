
import React, { useEffect, useState } from "react";
import HeroSlider from "@/components/HeroSlider";
import CategoryRow from "@/components/CategoryRow";
import { 
  getPopularMovies, 
  getTrendingMovies, 
  getPopularTVShows, 
  getTrendingTVShows 
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import RecentlyWatched from "@/components/RecentlyWatched";

const Index = () => {
  const { currentUser } = useAuth();
  const [heroItems, setHeroItems] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch hero items (trending movies)
        const trendingMoviesData = await getTrendingMovies();
        setHeroItems(trendingMoviesData.results.slice(0, 5));
        setTrendingMovies(trendingMoviesData.results);
        
        // Fetch other categories
        const [popularMoviesData, trendingTVData, popularTVData] = await Promise.all([
          getPopularMovies(),
          getTrendingTVShows(),
          getPopularTVShows()
        ]);
        
        setPopularMovies(popularMoviesData.results);
        setTrendingTVShows(trendingTVData.results);
        setPopularTVShows(popularTVData.results);
      } catch (error) {
        console.error("Error fetching data for homepage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider items={heroItems} isLoading={isLoading} />
      
      {/* Recently Watched (only for logged in users) */}
      {currentUser && <RecentlyWatched />}
      
      {/* Movie Categories */}
      <div className="py-8">
        <CategoryRow 
          title="Trending Movies" 
          items={trendingMovies} 
          type="movie"
          isLoading={isLoading}
        />
        
        <CategoryRow 
          title="Popular Movies" 
          items={popularMovies} 
          type="movie"
          isLoading={isLoading}
        />
        
        <CategoryRow 
          title="Trending TV Shows" 
          items={trendingTVShows} 
          type="tv"
          isLoading={isLoading}
        />
        
        <CategoryRow 
          title="Popular TV Shows" 
          items={popularTVShows} 
          type="tv"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
