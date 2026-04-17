import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getPopularTVShows,
  getTrendingTVShows,
  getTopRatedTVShows,
} from "@/lib/api";

type Category = "popular" | "trending" | "topRated" | "nowPlaying";
type MediaType = "movie" | "tv";

const TITLES: Record<Category, string> = {
  popular: "Most Popular",
  trending: "Trending",
  topRated: "Top Rated",
  nowPlaying: "In Cinemas",
};

async function fetchPage(category: Category, type: MediaType, page: number) {
  if (type === "movie") {
    if (category === "popular") return getPopularMovies(page);
    if (category === "trending") return getTrendingMovies();
    if (category === "topRated") return getTopRatedMovies(page);
    if (category === "nowPlaying") return getNowPlayingMovies(page);
  } else {
    if (category === "popular") return getPopularTVShows(page);
    if (category === "trending") return getTrendingTVShows();
    if (category === "topRated") return getTopRatedTVShows(page);
  }
  return null;
}

const Discover: React.FC = () => {
  const { category, type } = useParams<{ category: Category; type: MediaType }>();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const cat = (category || "popular") as Category;
  const mt = (type || "movie") as MediaType;

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      try {
        const data: any = await fetchPage(cat, mt, nextPage);
        const results = data?.results || [];
        setItems((prev) => (nextPage === 1 ? results : [...prev, ...results]));
        if (!results.length || (data?.total_pages && nextPage >= data.total_pages)) {
          setDone(true);
        }
      } catch (e) {
        console.error(e);
        setDone(true);
      } finally {
        setLoading(false);
      }
    },
    [cat, mt]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setDone(false);
    load(1);
  }, [cat, mt, load]);

  const onLoadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="w-9 h-9 grid place-items-center rounded-full bg-secondary/70 hover:bg-secondary transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {TITLES[cat]} {mt === "movie" ? "Movies" : "TV Shows"}
        </h1>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
        {items.map((item, i) => {
          const title = item.title || item.name;
          const year = (item.release_date || item.first_air_date || "").slice(0, 4);
          const href = `/${mt === "movie" ? "movie" : "tv"}/${item.id}`;
          return (
            <motion.div
              key={`${item.id}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min((i % 12) * 0.02, 0.2) }}
            >
              <Link
                to={href}
                className="block rounded-xl overflow-hidden bg-card border border-border/60 hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="aspect-[2/3] bg-muted">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium line-clamp-1">{title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {mt === "movie" ? "Movie" : "TV"} {year && `• ${year}`}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="aspect-[2/3] rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
      </div>

      <div className="mt-10 flex justify-center">
        {!done && !loading && items.length > 0 && (
          <button
            onClick={onLoadMore}
            className="h-10 px-6 rounded-full bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
          >
            Load more
          </button>
        )}
        {done && items.length > 0 && (
          <p className="text-xs text-muted-foreground">You’ve reached the end.</p>
        )}
        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Discover;
