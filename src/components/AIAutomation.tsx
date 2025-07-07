
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { generateAIRecommendations } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { Wand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AIAutomation: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    data?: any;
  }>({ success: false, message: "" });
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleGenerateRecommendations = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate recommendations",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      // Use the correct function name here
      const result = await generateAIRecommendations(prompt);
      
      // Parse the AI response as needed
      // The response is currently a string, so we need to extract movie data
      let movieData;
      try {
        // For demo purposes, we'll use a simple approach to extract movie titles and years
        const recommendations = result.match(/"([^"]+)"\s*\((\d{4})\)/g) || [];
        movieData = recommendations.map((rec, index) => {
          const match = rec.match(/"([^"]+)"\s*\((\d{4})\)/);
          if (match) {
            return {
              id: `ai-rec-${index}`,
              title: match[1],
              release_date: match[2] + "-01-01", // Just need the year for display
              poster_path: null, // We don't have poster paths for AI recommendations
            };
          }
          return null;
        }).filter(Boolean);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        movieData = [];
      }
      
      setResponse({
        success: true,
        message: "Successfully generated recommendations!",
        data: movieData
      });

      toast({
        title: "Success",
        description: "Successfully generated movie recommendations!",
        variant: "default",
      });

      // Clear prompt
      setPrompt("");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      
      setResponse({
        success: false,
        message: "Failed to generate recommendations. Please try again.",
      });
      
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/20 border border-white/10 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 md:gap-3">
            <Wand size={16} className="md:w-5 md:h-5 text-primary" />
            <h2 className="text-lg md:text-xl font-semibold">AI Movie Recommendations</h2>
          </div>
          
          <p className="text-sm md:text-base text-muted-foreground">
            Describe what kind of movie you're in the mood for, and our AI will recommend something for you.
          </p>
          
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-16 md:h-20 p-2 md:p-3 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm md:text-base resize-none"
            placeholder="e.g. 'I want something like Inception but with more action'"
          />
          
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={isGenerating || !prompt.trim()} 
            className="gap-2 w-full md:w-auto text-sm md:text-base py-2 md:py-3"
          >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand size={16} />
              Generate Recommendations
            </>
          )}
        </Button>
        
        <AnimatePresence>
          {response.success && response.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="font-medium">Recommended Movies:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {response.data.map((movie: any, index: number) => (
                  <motion.div
                    key={movie.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/30 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <div className="h-40 bg-black/50 overflow-hidden">
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{movie.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {movie.release_date?.substring(0, 4) || "Unknown Year"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIAutomation;
