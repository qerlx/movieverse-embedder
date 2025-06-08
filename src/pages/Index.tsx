
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
import { Heart, TrendingUp, Star, Tv, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getWatchHistory } from "@/lib/watchService";
import { ContinueWatchingItem } from "@/components/ContinueWatchingRow";
import StreamingProviders from "@/components/StreamingProviders";

const Index = () => {
  const { currentUser } = useAuth();
  const [heroItems, setHeroItems] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState<ContinueWatchingItem[]>([]);
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
              const formattedWatchHistory = watchHistory.map(item => ({
                ...item,
                poster_path: item.poster_path || item.posterPath || null,
                posterPath: item.posterPath || item.poster_path || null
              }));
              
              setContinueWatchingItems(formattedWatchHistory.slice(0, 6));
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
        staggerChildren: 0.15
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background pb-20">
      {/* Hero Slider with improved overlay */}
      {!isLoading && heroItems && heroItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full relative overflow-hidden"
        >
          <HeroSlider items={heroItems} type="movie" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
      
      {/* Loading indicator with improved design */}
      {isLoading && (
        <div className="py-20 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-20 h-20"
          >
            <motion.div 
              className="absolute inset-0 rounded-full border-3 border-t-primary border-r-primary/30 border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-primary border-l-primary/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
      
      {!isLoading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative -mt-16 z-10"
        >
          <div className="container mx-auto px-4 space-y-12">
            {/* Continue Watching Row with improved styling */}
            {currentUser && continueWatchingItems.length > 0 && (
              <motion.div variants={item}>
                <ContinueWatchingRow items={continueWatchingItems} />
              </motion.div>
            )}
            
            {/* User's favorites with enhanced header */}
            {currentUser && (
              <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30">
                    <Heart className="text-red-400" size={20} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                    Your Favorites
                  </h2>
                </div>
                <Favorites limit={6} />
              </motion.div>
            )}

            {/* Streaming Providers with improved layout */}
            <motion.div variants={item}>
              <StreamingProviders />
            </motion.div>
            
            {/* Top 10 Trending Movies with enhanced styling */}
            {trendingMovies.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <TrendingUp className="text-yellow-400" size={20} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Top 10 Movies Today
                  </h2>
                </div>
                <CategoryRow
                  title=""
                  items={trendingMovies.slice(0, 10)}
                  type="movie"
                  isRanked={true}
                />
              </motion.div>
            )}
            
            {/* Trending TV Shows with enhanced styling */}
            {trendingTVShows && trendingTVShows.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <Tv className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Trending TV Shows
                  </h2>
                </div>
                <CategoryRow
                  title=""
                  items={trendingTVShows}
                  type="tv"
                />
              </motion.div>
            )}
            
            {/* Popular Movies with enhanced styling */}
            {popularMovies && popularMovies.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <Film className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Popular Movies
                  </h2>
                </div>
                <CategoryRow
                  title=""
                  items={popularMovies} 
                  type="movie"
                />
              </motion.div>
            )}
            
            {/* Popular TV Shows with enhanced styling */}
            {popularTVShows && popularTVShows.length > 0 && (
              <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30">
                    <Star className="text-green-400" size={20} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Popular TV Shows
                  </h2>
                </div>
                <CategoryRow
                  title=""
                  items={popularTVShows} 
                  type="tv"
                />
              </motion.div>
            )}
            
            {/* Personalized Recommendations with enhanced styling */}
            {currentUser && (
              <motion.div variants={item} className="pb-8">
                <PersonalizedRecommendations />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
