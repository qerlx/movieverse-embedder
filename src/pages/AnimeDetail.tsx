import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Calendar, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { getAnimeDetail, getAnimeTitle } from "@/lib/anilist";
import AnimeRow from "@/components/anime/AnimeRow";

const AnimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const animeId = Number(id);

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ["anime", "detail", animeId],
    queryFn: () => getAnimeDetail(animeId),
    enabled: !!animeId,
    staleTime: 1000 * 60 * 30,
  });

  const totalEpisodes = anime?.episodes || anime?.nextAiringEpisode?.episode || 12;
  const [selectedEp, setSelectedEp] = useState(1);

  const episodes = useMemo(
    () => Array.from({ length: totalEpisodes }, (_, i) => i + 1),
    [totalEpisodes]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Failed to load anime details.
      </div>
    );
  }

  const title = getAnimeTitle(anime);
  const description = (anime.description || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const studio = anime.studios?.nodes?.[0]?.name;

  const watchHref = `/watch/anime/${anime.id}/1/${selectedEp}`;

  const recommendations =
    anime.recommendations?.nodes
      ?.map((n: any) => n.mediaRecommendation)
      .filter(Boolean) || [];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero / Backdrop */}
      <div className="relative -mt-14 md:-mt-16">
        <div className="relative h-[55vh] md:h-[70vh] overflow-hidden">
          {anime.bannerImage ? (
            <img
              src={anime.bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${anime.coverImage?.color || "#1a1a2e"}, transparent)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />

          <button
            onClick={() => navigate(-1)}
            className="absolute top-20 left-4 md:left-8 z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground bg-background/60 backdrop-blur px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-40 md:-mt-56 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Poster */}
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={anime.coverImage?.extraLarge || anime.coverImage?.large}
              alt={title}
              className="w-40 md:w-60 lg:w-64 aspect-[2/3] rounded-xl shadow-2xl border border-border/60 object-cover self-start"
            />

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 pt-2 md:pt-8"
            >
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">{title}</h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                {score && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-foreground font-semibold">{score}</span>/10
                  </span>
                )}
                {anime.seasonYear && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {anime.seasonYear}
                  </span>
                )}
                {anime.episodes && <span>{anime.episodes} episodes</span>}
                {anime.duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {anime.duration}m
                  </span>
                )}
                {anime.format && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-semibold">
                    {anime.format}
                  </span>
                )}
                {anime.status && (
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                    {anime.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              {anime.genres?.length ? (
                <div className="flex flex-wrap gap-2 mb-5">
                  {anime.genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary/70 text-muted-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              ) : null}

              {description && (
                <p className="text-sm md:text-base text-muted-foreground/90 max-w-3xl line-clamp-5 mb-6 whitespace-pre-line">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 items-center">
                <Link
                  to={watchHref}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  <Play className="w-5 h-5 fill-current" /> Watch Episode {selectedEp}
                </Link>
                {studio && (
                  <span className="text-sm text-muted-foreground">
                    by <span className="text-foreground">{studio}</span>
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-10 md:mt-16">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Episodes</h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {episodes.map((ep) => (
            <Link
              key={ep}
              to={`/watch/anime/${anime.id}/1/${ep}`}
              onClick={() => setSelectedEp(ep)}
              className={`aspect-square grid place-items-center rounded-lg text-sm font-medium border transition-colors ${
                ep === selectedEp
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {ep}
            </Link>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div className="mt-14">
            <AnimeRow title="You may also like" items={recommendations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;
