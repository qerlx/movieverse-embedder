
import React, { useEffect, useState, useCallback } from "react";
import { Suspense, lazy } from "react";
import CategoryRow from "@/components/CategoryRow";
import { 
  getPopularMovies, 
  getTrendingMovies, 
  getPopularTVShows, 
  getTrendingTVShows 
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Favorites from "@/components/Favorites";
import RecentlyWatchedList from "@/components/RecentlyWatchedList";
import { Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getRecentlyWatched } from "@/lib/firebase-watch";
import StreamingProviders from "@/components/StreamingProviders";
import { LOADING_SKELETON_COUNT } from "@/constants";

// Lazy load heavy components
const HeroSlider = lazy(() => import("@/components/HeroSlider"));
const PersonalizedRecommendations = lazy(() => import("@/components/PersonalizedRecommendations"));

interface IndexState {
  heroItems: any[];
  trendingMovies: any[];
  popularMovies: any[];
  trendingTVShows: any[];
  popularTVShows: any[];
  isLoading: boolean;
  error: string | null;
}

const Index: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [state, setState] = useState<IndexState>({
    heroItems: [],
    trendingMovies: [],
    popularMovies: [],
    trendingTVShows: [],
    popularTVShows: [],
    isLoading: true,
    error: null
  });
  
  // Memoized fetch function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch trending movies first for hero
      const trendingMoviesData = await getTrendingMovies();
      if (trendingMoviesData?.results) {
        setState(prev => ({
          ...prev,
          heroItems: trendingMoviesData.results.slice(0, 5),
          trendingMovies: trendingMoviesData.results
        }));
      }
      
      // Fetch other categories in parallel
      const [popularMoviesData, trendingTVData, popularTVData] = await Promise.all([
        getPopularMovies(),
        getTrendingTVShows(),
        getPopularTVShows()
      ]);
      
      setState(prev => ({
        ...prev,
        popularMovies: popularMoviesData?.results || [],
        trendingTVShows: trendingTVData?.results || [],
        popularTVShows: popularTVData?.results || [],
        isLoading: false
      }));
      
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      setState(prev => ({
        ...prev,
        error: "Failed to load content. Please refresh the page.",
        isLoading: false
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Loading skeleton component
  const LoadingSkeleton = () => (
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
  );

  if (state.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider */}
      {!state.isLoading && state.heroItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full relative overflow-hidden"
        >
          <Suspense fallback={<LoadingSkeleton />}>
            <HeroSlider items={state.heroItems} type="movie" />
          </Suspense>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
      
      {/* Loading */}
      {state.isLoading && <LoadingSkeleton />}
      
      {!state.isLoading && (
        <div className="relative -mt-12 z-10">
          <div className="container mx-auto px-4 space-y-8">
            
            {/* Recently Watched */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Continue Watching
                </h2>
                <RecentlyWatchedList limit={6} />
              </motion.div>
            )}

            {/* My List/Favorites */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  My List
                </h2>
                <Favorites limit={6} />
              </motion.div>
            )}

            {/* Streaming Providers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <StreamingProviders />
            </motion.div>
            
            {/* Trending Now */}
            {state.trendingMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CategoryRow
                  title="Trending Now"
                  items={state.trendingMovies.slice(0, 10)}
                  type="movie"
                  isRanked={true}
                />
              </motion.div>
            )}
            
            {/* Popular TV Shows */}
            {state.trendingTVShows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <CategoryRow
                  title="Popular TV Shows"
                  items={state.trendingTVShows}
                  type="tv"
                />
              </motion.div>
            )}
            
            {/* Popular Movies */}
            {state.popularMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <CategoryRow
                  title="Popular Movies"
                  items={state.popularMovies} 
                  type="movie"
                />
              </motion.div>
            )}
            
            {/* Binge-Worthy Series */}
            {state.popularTVShows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <CategoryRow
                  title="Binge-Worthy Series"
                  items={state.popularTVShows} 
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
                <Suspense fallback={<div className="h-48 bg-muted/20 rounded-lg animate-pulse" />}>
                  <PersonalizedRecommendations />
                </Suspense>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
