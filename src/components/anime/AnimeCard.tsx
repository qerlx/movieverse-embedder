import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { AniMedia } from "@/lib/anilist";
import { getAnimeTitle } from "@/lib/anilist";

interface AnimeCardProps {
  anime: AniMedia;
  index?: number;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, index = 0 }) => {
  const title = getAnimeTitle(anime);
  const img = anime.coverImage?.extraLarge || anime.coverImage?.large;
  const year = anime.seasonYear || anime.startDate?.year;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Link
        to={`/anime/${anime.id}`}
        className="group block rounded-xl overflow-hidden bg-card border border-border/60 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="aspect-[2/3] bg-muted relative overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
              No image
            </div>
          )}
          {score && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-0.5 rounded-full text-[11px] font-medium">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {score}
            </div>
          )}
          {anime.format && (
            <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
              {anime.format}
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium text-foreground line-clamp-1">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {anime.episodes ? `${anime.episodes} ep` : "Anime"}
            {year && ` • ${year}`}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
