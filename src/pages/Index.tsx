
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
import RecentlyWatchedList from "@/components/RecentlyWatchedList";
import { Heart, TrendingUp, Star, Tv, Film } from "lucide-react";
import { motion } from "framer-motion";
import { getRecentlyWatched } from "@/lib/firebase-watch";
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
            const watchHistory = await getRecentlyWatched(currentUser, 6);
            if (watchHistory && watchHistory.length > 0) {
              const formattedWatchHistory = watchHistory.map(item => ({
                id: parseInt(item.mediaId),
                type: item.mediaType,
                title: item.title,
                poster_path: item.posterPath,
                progress: item.progress,
                lastEpisode: item.lastEpisode
              }));
              
              setContinueWatchingItems(formattedWatchHistory);
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
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider */}
      {!isLoading && heroItems && heroItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full relative overflow-hidden"
        >
          <HeroSlider items={heroItems} type="movie" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
      
      {/* Loading */}
      {isLoading && (
        <div className="py-20 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-16 h-16"
          >
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
      
      {!isLoading && (
        <div className="relative -mt-12 z-10">
          <div className="container mx-auto px-4 space-y-8">
            
            {/* My List/Favorites */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">My List</h2>
                <Favorites limit={6} />
              </motion.div>
            )}

            {/* Streaming Providers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StreamingProviders />
            </motion.div>
            
            {/* Trending Now */}
            {trendingMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CategoryRow
                  title="Trending Now"
                  items={trendingMovies.slice(0, 10)}
                  type="movie"
                  isRanked={true}
                />
              </motion.div>
            )}
            
            {/* Popular on Netflix-style TV Shows */}
            {trendingTVShows && trendingTVShows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <CategoryRow
                  title="Popular TV Shows"
                  items={trendingTVShows}
                  type="tv"
                />
              </motion.div>
            )}
            
            {/* Because you watched */}
            {popularMovies && popularMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <CategoryRow
                  title="Popular Movies"
                  items={popularMovies} 
                  type="movie"
                />
              </motion.div>
            )}
            
            {/* Watch it Again */}
            {popularTVShows && popularTVShows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <CategoryRow
                  title="Binge-Worthy Series"
                  items={popularTVShows} 
                  type="tv"
                />
              </motion.div>
            )}
            
            {/* Personalized Recommendations */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="pb-8"
              >
                <PersonalizedRecommendations />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
