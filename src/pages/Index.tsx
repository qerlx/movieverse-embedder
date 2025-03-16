
import React, { useEffect, useState } from "react";
import HeroSlider from "@/components/HeroSlider";
import CategoryRow from "@/components/CategoryRow";
import DnsPopup from "@/components/DnsPopup";
import { useToast } from "@/hooks/use-toast";
import { Movie, TVShow } from "@/types";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getTrendingMovies,
  getTrendingTVShows
} from "@/lib/api";

const Index = () => {
  const { toast } = useToast();
  const [heroItems, setHeroItems] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch now playing movies for hero
        const nowPlaying = await getNowPlayingMovies();
        setHeroItems(nowPlaying.results.slice(0, 5));
        setNowPlayingMovies(nowPlaying.results);
        
        // Fetch other movie categories
        const [trending, popular, topRated, tvPopular, tvTrending] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getPopularTVShows(),
          getTrendingTVShows()
        ]);
        
        setTrendingMovies(trending.results);
        setPopularMovies(popular.results);
        setTopRatedMovies(topRated.results);
        setPopularTVShows(tvPopular.results);
        setTrendingTVShows(tvTrending.results);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 relative">
      {/* DNS Popup - only shown on home page */}
      <DnsPopup />
      
      {heroItems.length > 0 && (
        <HeroSlider items={heroItems} type="movie" />
      )}
      
      <div className="space-y-2 mt-4">
        <CategoryRow 
          title="Trending Movies" 
          items={trendingMovies} 
          type="movie" 
        />
        
        <CategoryRow 
          title="Popular Movies" 
          items={popularMovies} 
          type="movie" 
        />
        
        <CategoryRow 
          title="Now Playing" 
          items={nowPlayingMovies} 
          type="movie" 
        />
        
        <CategoryRow 
          title="Top Rated Movies" 
          items={topRatedMovies} 
          type="movie" 
        />
        
        <CategoryRow 
          title="Popular TV Shows" 
          items={popularTVShows} 
          type="tv" 
        />
        
        <CategoryRow 
          title="Trending TV Shows" 
          items={trendingTVShows} 
          type="tv" 
        />
      </div>
      
      {/* Subtle credit at the bottom */}
      <div className="text-xs text-muted-foreground/40 text-center mt-12 mb-4">
        Made by qerlx
      </div>
    </div>
  );
};

export default Index;
