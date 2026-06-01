import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { browseAnime, ANIME_GENRES, type AniMedia } from "@/lib/anilist";
import AnimeRow from "@/components/anime/AnimeRow";
import AnimeCard from "@/components/anime/AnimeCard";

const currentMonth = new Date().getMonth();
const currentSeason: "WINTER" | "SPRING" | "SUMMER" | "FALL" =
  currentMonth < 3 ? "WINTER" : currentMonth < 6 ? "SPRING" : currentMonth < 9 ? "SUMMER" : "FALL";
const currentYear = new Date().getFullYear();

const Anime: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [genre, setGenre] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const isFiltering = debounced.length > 0 || !!genre;

  const trending = useQuery({
    queryKey: ["anime", "trending"],
    queryFn: () => browseAnime({ sort: "TRENDING_DESC", perPage: 20 }),
    staleTime: 1000 * 60 * 10,
    enabled: !isFiltering,
  });
  const popular = useQuery({
    queryKey: ["anime", "popular"],
    queryFn: () => browseAnime({ sort: "POPULARITY_DESC", perPage: 20 }),
    staleTime: 1000 * 60 * 10,
    enabled: !isFiltering,
  });
  const topRated = useQuery({
    queryKey: ["anime", "top"],
    queryFn: () => browseAnime({ sort: "SCORE_DESC", perPage: 20 }),
    staleTime: 1000 * 60 * 10,
    enabled: !isFiltering,
  });
  const seasonal = useQuery({
    queryKey: ["anime", "seasonal", currentSeason, currentYear],
    queryFn: () =>
      browseAnime({
        sort: "POPULARITY_DESC",
        season: currentSeason,
        seasonYear: currentYear,
        perPage: 20,
      }),
    staleTime: 1000 * 60 * 10,
    enabled: !isFiltering,
  });
  const airing = useQuery({
    queryKey: ["anime", "airing"],
    queryFn: () => browseAnime({ sort: "POPULARITY_DESC", status: "RELEASING", perPage: 20 }),
    staleTime: 1000 * 60 * 10,
    enabled: !isFiltering,
  });

  const filtered = useQuery({
    queryKey: ["anime", "filter", debounced, genre],
    queryFn: () =>
      browseAnime({
        search: debounced || undefined,
        genre: genre || undefined,
        sort: debounced ? "POPULARITY_DESC" : "TRENDING_DESC",
        perPage: 40,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: isFiltering,
  });

  const heroAnime = trending.data?.media?.[0];
  const heroTitle = heroAnime?.title?.english || heroAnime?.title?.romaji || "";

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] -mt-14 md:-mt-16 overflow-hidden">
        {heroAnime?.bannerImage && (
          <img
            src={heroAnime.bannerImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-end pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Anime
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              {heroTitle || "Discover your next favorite anime"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl">
              Stream subbed and dubbed anime. Search across thousands of titles powered by AniList.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-card/80 backdrop-blur border border-border focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-4">
        {/* Genre chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          <button
            onClick={() => setGenre("")}
            className={`shrink-0 px-4 h-9 rounded-full text-sm border transition-colors ${
              !genre
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/60 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {ANIME_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g === genre ? "" : g)}
              className={`shrink-0 px-4 h-9 rounded-full text-sm border transition-colors ${
                genre === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/60 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {isFiltering ? (
          <FilteredGrid
            items={filtered.data?.media || []}
            isLoading={filtered.isLoading}
            label={debounced ? `Results for "${debounced}"` : `Genre: ${genre}`}
          />
        ) : (
          <div className="space-y-10 md:space-y-12">
            <AnimeRow title="Trending Now" items={trending.data?.media || []} />
            <AnimeRow title="Currently Airing" items={airing.data?.media || []} />
            <AnimeRow
              title={`${currentSeason.charAt(0)}${currentSeason.slice(1).toLowerCase()} ${currentYear}`}
              items={seasonal.data?.media || []}
            />
            <AnimeRow title="All-Time Popular" items={popular.data?.media || []} />
            <AnimeRow title="Top Rated" items={topRated.data?.media || []} />
          </div>
        )}
      </div>
    </div>
  );
};

const FilteredGrid: React.FC<{ items: AniMedia[]; isLoading: boolean; label: string }> = ({
  items,
  isLoading,
  label,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading...
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        No anime found.
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-lg md:text-xl font-semibold mb-4">{label}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {items.map((a, i) => (
          <AnimeCard key={a.id} anime={a} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Anime;
