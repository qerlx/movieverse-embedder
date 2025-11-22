
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
import FavoritesList from "@/components/FavoritesList";
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background via-background/98 to-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Outer glowing ring */}
        <motion.div 
          className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-primary via-primary/60 to-primary opacity-40"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Main spinner */}
        <motion.div 
          className="relative w-20 h-20 rounded-full border-4 border-transparent border-t-primary border-r-primary shadow-2xl shadow-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-transparent"
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      
      {/* Loading text */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-2">
          Loading
        </h2>
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
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
          {/* Enhanced gradient blend */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-10" />
        </motion.div>
      )}
      
      {/* Loading */}
      {state.isLoading && <LoadingSkeleton />}
      
      {!state.isLoading && (
        <div className="relative -mt-32 z-20">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12 pb-16">
            
            {/* Recently Watched */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Continue Watching
                  </span>
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
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-primary" />
                  <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    My List
                  </span>
                </h2>
                <FavoritesList />
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
                  title="🔥 Trending Now"
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
                  title="📺 Popular TV Shows"
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
                  title="🎬 Popular Movies"
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
                  title="⭐ Binge-Worthy Series"
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
