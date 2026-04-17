import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export interface PosterItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface PosterRowProps {
  title: string;
  items: PosterItem[];
  type: "movie" | "tv";
  viewMoreHref?: string;
}

const PosterRow: React.FC<PosterRowProps> = ({ title, items, type, viewMoreHref }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!items?.length) return null;

  return (
    <section className="group/row">
      <div className="flex items-end justify-between mb-3 px-1">
        <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {viewMoreHref && (
          <Link
            to={viewMoreHref}
            className="text-xs md:text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            View more <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Arrows (desktop) */}
        <button
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
          className="hidden md:grid place-items-center absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scroll(1)}
          className="hidden md:grid place-items-center absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-2"
        >
          {items.map((item, i) => {
            const title = item.title || item.name || "Untitled";
            const year = (item.release_date || item.first_air_date || "").slice(0, 4);
            const href = `/${type === "movie" ? "movie" : "tv"}/${item.id}`;
            return (
              <motion.div
                key={`${item.id}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.02, 0.2) }}
                className="snap-start shrink-0 w-[42vw] sm:w-44 md:w-48 lg:w-52"
              >
                <Link
                  to={href}
                  className="block rounded-xl overflow-hidden bg-card border border-border/60 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="aspect-[2/3] bg-muted relative">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {type === "movie" ? "Movie" : "TV"} {year && `• ${year}`}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PosterRow;
