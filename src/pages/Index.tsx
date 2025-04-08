
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
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getWatchHistory } from "@/lib/watchService";

const Index = () => {
  const { currentUser } = useAuth();
  const [heroItems, setHeroItems] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
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
        
        // Fetch continue watching data for logged in users
        if (currentUser) {
          try {
            const watchHistory = await getWatchHistory(currentUser);
            if (watchHistory && watchHistory.length > 0) {
              setContinueWatchingItems(watchHistory.slice(0, 6));
            }
          } catch (error) {
            console.error("Error fetching watch history:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data for homepage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Section staggered animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Slider - Only render when data is loaded */}
      {!isLoading && heroItems && heroItems.length > 0 && <HeroSlider items={heroItems} type="movie" />}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="py-20 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          ></motion.div>
        </div>
      )}
      
      {!isLoading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="py-4 container mx-auto px-4"
        >
          {/* Continue Watching Row */}
          {currentUser && continueWatchingItems.length > 0 && (
            <motion.div variants={item}>
              <ContinueWatchingRow items={continueWatchingItems} />
            </motion.div>
          )}
          
          {/* User's favorites (only for logged in users) */}
          {currentUser && (
            <motion.div variants={item} className="mt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
                <Heart className="mr-2 text-red-500" size={20} />
                <span className="bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">Your Favorites</span>
              </h2>
              <Favorites limit={6} />
            </motion.div>
          )}
          
          {/* Top 10 Trending Movies Today */}
          {trendingMovies.length > 0 && (
            <motion.div variants={item}>
              <CategoryRow
                title="Top 10 Movies Today"
                items={trendingMovies.slice(0, 10)}
                type="movie"
                isRanked={true}
                className="my-8"
              />
            </motion.div>
          )}
          
          {/* Trending TV Shows */}
          {trendingTVShows && trendingTVShows.length > 0 && (
            <motion.div variants={item}>
              <CategoryRow
                title="Trending TV Shows" 
                items={trendingTVShows}
                type="tv"
                className="my-8"
              />
            </motion.div>
          )}
          
          {/* Popular Movies */}
          {popularMovies && popularMovies.length > 0 && (
            <motion.div variants={item}>
              <CategoryRow
                title="Popular Movies" 
                items={popularMovies} 
                type="movie"
                className="my-8"
              />
            </motion.div>
          )}
          
          {/* Popular TV Shows */}
          {popularTVShows && popularTVShows.length > 0 && (
            <motion.div variants={item}>
              <CategoryRow
                title="Popular TV Shows" 
                items={popularTVShows} 
                type="tv"
                className="my-8"
              />
            </motion.div>
          )}
          
          {/* Personalized Recommendations (only for logged in users) */}
          {currentUser && (
            <motion.div variants={item}>
              <PersonalizedRecommendations />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Index;
