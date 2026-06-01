import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import type { AniMedia } from "@/lib/anilist";

interface AnimeRowProps {
  title: string;
  items: AniMedia[];
  viewMoreHref?: string;
}

const AnimeRow: React.FC<AnimeRowProps> = ({ title, items, viewMoreHref }) => {
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
        <h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
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
          {items.map((a, i) => (
            <div key={a.id} className="snap-start shrink-0 w-[42vw] sm:w-44 md:w-48 lg:w-52">
              <AnimeCard anime={a} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimeRow;
