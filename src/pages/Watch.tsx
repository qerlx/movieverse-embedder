
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails, getTVShowDetails } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id || !type) return;
      
      try {
        setIsLoading(true);
        const itemId = parseInt(id);
        
        if (type === "movie") {
          // Fetch movie details
          const movieData = await getMovieDetails(itemId);
          setTitle(movieData.title);
          setEmbedUrl(`https://embed.su/embed/movie/${itemId}`);
        } else if (type === "tv" && season && episode) {
          // Fetch TV show details
          const tvData = await getTVShowDetails(itemId);
          setTitle(`${tvData.name} - S${season} E${episode}`);
          setEmbedUrl(`https://embed.su/embed/tv/${itemId}/${season}/${episode}`);
        } else {
          // Invalid parameters for TV show
          throw new Error("Invalid parameters for TV show");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        toast({
          title: "Error",
          description: "Failed to load media. Please try again later.",
          variant: "destructive",
        });
        // Navigate back on error
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, type, season, episode, navigate, toast]);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-primary transition-colors flex items-center"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-xl font-medium text-white ml-4">{title}</h1>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="w-full h-full relative rounded-lg overflow-hidden bg-muted animate-fade-in">
              <iframe
                src={embedUrl}
                title={title}
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
