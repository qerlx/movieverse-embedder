import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import HeroPrompt from "@/components/pstream/HeroPrompt";
import PosterRow from "@/components/pstream/PosterRow";
import RecentlyWatchedList from "@/components/RecentlyWatchedList";
import {
  getPopularMovies,
  getTrendingMovies,
  getPopularTVShows,
  getTrendingTVShows,
  getTopRatedMovies,
  getNowPlayingMovies,
} from "@/lib/api";

interface IndexState {
  trendingMovies: any[];
  popularMovies: any[];
  topRatedMovies: any[];
  nowPlaying: any[];
  trendingTV: any[];
  popularTV: any[];
  isLoading: boolean;
  error: string | null;
}

const Index: React.FC = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<IndexState>({
    trendingMovies: [],
    popularMovies: [],
    topRatedMovies: [],
    nowPlaying: [],
    trendingTV: [],
    popularTV: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trending, popular, topRated, nowPlaying, trendingTV, popularTV] =
          await Promise.all([
            getTrendingMovies(),
            getPopularMovies(),
            getTopRatedMovies(),
            getNowPlayingMovies(),
            getTrendingTVShows(),
            getPopularTVShows(),
          ]);
        if (cancelled) return;
        setState({
          trendingMovies: trending?.results || [],
          popularMovies: popular?.results || [],
          topRatedMovies: topRated?.results || [],
          nowPlaying: nowPlaying?.results || [],
          trendingTV: trendingTV?.results || [],
          popularTV: popularTV?.results || [],
          isLoading: false,
          error: null,
        });
      } catch (e) {
        console.error(e);
        if (!cancelled)
          setState((s) => ({
            ...s,
            isLoading: false,
            error: "Failed to load content. Please refresh.",
          }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const RowSkeleton = () => (
    <div className="space-y-3">
      <div className="h-5 w-40 bg-muted/60 rounded animate-pulse" />
      <div className="flex gap-3 md:gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[42vw] sm:w-44 md:w-48 lg:w-52 aspect-[2/3] rounded-xl bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <HeroPrompt />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-6 md:-mt-10 space-y-10 md:space-y-12 pb-24 relative z-10">
        {currentUser && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              Continue Watching
            </h2>
            <RecentlyWatchedList limit={8} />
          </motion.section>
        )}

        {state.error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : (
          <>
            <PosterRow
              title="Most Popular"
              items={state.popularMovies}
              type="movie"
              viewMoreHref="/discover/popular/movie"
            />
            <PosterRow
              title="In Cinemas"
              items={state.nowPlaying}
              type="movie"
              viewMoreHref="/discover/nowPlaying/movie"
            />
            <PosterRow
              title="Trending Today"
              items={state.trendingMovies}
              type="movie"
              viewMoreHref="/discover/trending/movie"
            />
            <PosterRow
              title="Top Rated"
              items={state.topRatedMovies}
              type="movie"
              viewMoreHref="/discover/topRated/movie"
            />
            <PosterRow
              title="Trending TV Shows"
              items={state.trendingTV}
              type="tv"
              viewMoreHref="/discover/trending/tv"
            />
            <PosterRow
              title="Popular TV Shows"
              items={state.popularTV}
              type="tv"
              viewMoreHref="/discover/popular/tv"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
