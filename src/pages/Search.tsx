
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { searchMulti } from "@/lib/api";
import { MediaItem, Movie, TVShow } from "@/types";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [inputQuery, setInputQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query.trim()) {
      setSearchQuery(query);
      setInputQuery(query);
      fetchResults(query, 1);
    }
  }, [searchParams]);

  const fetchResults = async (query: string, page: number) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      
      const data = await searchMulti(query, page);
      // Transform MediaItem results to Movie or TVShow
      const filteredResults = data.results
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .map((item: any): Movie | TVShow => {
          if (item.media_type === "movie") {
            return {
              id: item.id,
              title: item.title,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              release_date: item.release_date || "",
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              popularity: item.popularity || 0,
              adult: item.adult || false,
              video: item.video || false,
              original_language: item.original_language || "",
              media_type: "movie",
            } as Movie;
          } else {
            return {
              id: item.id,
              name: item.name,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              first_air_date: item.first_air_date || "",
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              popularity: item.popularity || 0,
              original_language: item.original_language || "",
              origin_country: item.origin_country || [],
              media_type: "tv",
            } as TVShow;
          }
        });
      
      setResults(filteredResults);
      setTotalPages(Math.min(data.total_pages, 20)); // Limit to 20 pages
      setCurrentPage(page);
      
    } catch (error) {
      console.error("Error searching:", error);
      toast({
        title: "Error",
        description: "Failed to search. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery });
      fetchResults(inputQuery, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(searchQuery, page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for movies or TV shows..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {searchQuery && (
        <h2 className="text-xl font-bold mb-6">
          Search results for "{searchQuery}"
        </h2>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map((item, index) => (
              <MovieCard
                key={`${item.id}-${(item as any).media_type}`}
                item={item}
                type={(item as any).media_type === "movie" ? "movie" : "tv"}
                priority={index < 12}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center px-4 text-sm">
                  <span className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
          <p className="text-sm mb-6">Try using different keywords or browse our categories</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/movies")}>Browse Movies</Button>
            <Button onClick={() => navigate("/tv-shows")} variant="outline">Browse TV Shows</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Search;
