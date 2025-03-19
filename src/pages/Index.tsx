
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
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import Favorites from "@/components/Favorites";
import { Heart } from "lucide-react";
import AIBuddy from "@/components/AIBuddy";

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
        if (trendingMoviesData && trendingMoviesData.results) {
          setHeroItems(trendingMoviesData.results.slice(0, 5));
          setTrendingMovies(trendingMoviesData.results);
        }
        
        // Fetch other categories
        const [popularMoviesData, trendingTVData, popularTVData] = await Promise.all([
          getPopularMovies(),
          getTrendingTVShows(),
          getPopularTVShows()
        ]);
        
        if (popularMoviesData?.results) setPopularMovies(popularMoviesData.results);
        if (trendingTVData?.results) setTrendingTVShows(trendingTVData.results);
        if (popularTVData?.results) setPopularTVShows(popularTVData.results);
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
      {/* Hero Slider - Only render when data is loaded */}
      {!isLoading && heroItems && heroItems.length > 0 && <HeroSlider items={heroItems} type="movie" />}
      
      {/* AI Buddy Button (for everyone) */}
      <div className="container mx-auto px-4 mt-8">
        <AIBuddy />
      </div>
      
      {/* User's favorites (only for logged in users) */}
      {currentUser && (
        <div className="container mx-auto px-4 mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Heart className="mr-2 text-red-500" size={20} />
            Your Favorites
          </h2>
          <Favorites limit={6} />
        </div>
      )}
      
      {/* Personalized Recommendations (only for logged in users) */}
      {currentUser && <PersonalizedRecommendations />}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Movie Categories - Only render when data is loaded */}
      {!isLoading && (
        <div className="py-8">
          {trendingMovies && trendingMovies.length > 0 && (
            <CategoryRow 
              title="Trending Movies" 
              items={trendingMovies} 
              type="movie"
            />
          )}
          
          {popularMovies && popularMovies.length > 0 && (
            <CategoryRow 
              title="Popular Movies" 
              items={popularMovies} 
              type="movie"
            />
          )}
          
          {trendingTVShows && trendingTVShows.length > 0 && (
            <CategoryRow 
              title="Trending TV Shows" 
              items={trendingTVShows} 
              type="tv"
            />
          )}
          
          {popularTVShows && popularTVShows.length > 0 && (
            <CategoryRow 
              title="Popular TV Shows" 
              items={popularTVShows} 
              type="tv"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
