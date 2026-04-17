import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

/**
 * Big "What would you like to watch tonight?" hero with centered search.
 * Mirrors the P-Stream homepage entry point.
 */
const HeroPrompt: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="relative min-h-[58vh] md:min-h-[64vh] flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.6), transparent 60%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl px-6 text-center"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground/95 leading-tight">
          What would you like to watch tonight?
        </h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          Search a title, browse trending, or pick from a curated row.
        </p>

        <form onSubmit={submit} className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Find a movie or show…"
              className="w-full h-14 pl-12 pr-4 rounded-full bg-card/80 backdrop-blur-md border border-border text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow shadow-lg"
              aria-label="Search movies and shows"
            />
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          {["Movies", "TV Shows", "Editor Picks"].map((label, i) => (
            <button
              key={label}
              onClick={() =>
                navigate(
                  i === 0 ? "/movies" : i === 1 ? "/tv-shows" : "/collections"
                )
              }
              className="px-3.5 py-1.5 rounded-full bg-secondary/70 hover:bg-secondary text-foreground/80 hover:text-foreground transition-colors border border-border/60"
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroPrompt;
