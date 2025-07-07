
import React, { useState, useEffect } from "react";
import { generateAIRecommendations, analyzeWatchHistory, generateMediaTrivia } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  CornerDownLeft, 
  Loader2, 
  Popcorn,
  Film,
  HeartHandshake,
  BookOpen,
  PanelTop,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieCard from "@/components/MovieCard";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { searchMulti } from "@/lib/api";

const EXAMPLE_PROMPTS = [
  "Recommend movies similar to 'Eternal Sunshine of the Spotless Mind'",
  "What are some good sci-fi TV shows with strong female leads?",
  "I enjoy psychological thrillers with plot twists. What should I watch?",
  "Recommend me uplifting movies that aren't too cheesy",
  "What are some good animated films for adults?"
];

const HISTORY_EXAMPLES = [
  "Inception, The Matrix, Interstellar, Blade Runner 2049",
  "Stranger Things, Breaking Bad, Game of Thrones, The Mandalorian",
  "The Shawshank Redemption, The Godfather, Fight Club, Parasite",
  "The Queen's Gambit, Chernobyl, True Detective, Fargo"
];

const TRIVIA_EXAMPLES = [
  "The Matrix",
  "Stranger Things",
  "Inception",
  "Breaking Bad"
];

interface ExtractedTitle {
  title: string;
  type: "movie" | "tv";
  year?: string;
  poster_path?: string;
  id?: number;
}

const AIRecommendations: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recommend");
  const [watchHistory, setWatchHistory] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [extractedTitles, setExtractedTitles] = useState<ExtractedTitle[]>([]);
  const [isSearchingTitles, setIsSearchingTitles] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract movie/show titles from AI response and search for them
  useEffect(() => {
    if (!response) return;
    
    // Simple regex to try to extract titles from the response
    const extractTitles = async () => {
      setIsSearchingTitles(true);
      
      try {
        // Use regex to find potential titles with optional year in parentheses
        // Look for patterns like "Title (Year)" or just titles with quotes
        const titleRegex = /"([^"]+)"|'([^']+)'|(?:^|\n)[^"'\n]*?([A-Z][a-zA-Z0-9 :&!,.'-]+)(?:\s+\((\d{4})\))?/g;
        let match;
        const potentialTitles: ExtractedTitle[] = [];
        
        while ((match = titleRegex.exec(response)) !== null) {
          const title = match[1] || match[2] || match[3];
          const year = match[4];
          
          if (title && title.length > 2 && !title.includes("http") && !potentialTitles.some(t => t.title === title)) {
            potentialTitles.push({ 
              title: title.trim(), 
              type: "movie", // Default to movie, will update after search
              year 
            });
          }
        }
        
        // Limit to 6 most likely titles to avoid too many API calls
        const titlesToSearch = potentialTitles.slice(0, 6);
        const searchResults = await Promise.all(
          titlesToSearch.map(async ({ title }) => {
            try {
              const searchResult = await searchMulti(title, 1);
              if (searchResult.results && searchResult.results.length > 0) {
                const firstResult = searchResult.results[0];
                return {
                  title,
                  type: firstResult.media_type === "tv" ? "tv" : "movie",
                  year: firstResult.media_type === "tv" 
                    ? firstResult.first_air_date?.substring(0, 4)
                    : firstResult.release_date?.substring(0, 4),
                  poster_path: firstResult.poster_path,
                  id: firstResult.id
                };
              }
              return null;
            } catch (error) {
              console.error(`Error searching for ${title}:`, error);
              return null;
            }
          })
        );
        
        const validResults = searchResults.filter(result => result !== null) as ExtractedTitle[];
        setExtractedTitles(validResults);
      } catch (error) {
        console.error("Error extracting titles:", error);
      } finally {
        setIsSearchingTitles(false);
      }
    };
    
    extractTitles();
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let inputText = "";
    let aiFunction;
    
    switch (activeTab) {
      case "recommend":
        inputText = prompt;
        aiFunction = generateAIRecommendations;
        break;
      case "analyze":
        inputText = watchHistory;
        aiFunction = analyzeWatchHistory;
        break;
      case "trivia":
        inputText = mediaTitle;
        aiFunction = generateMediaTrivia;
        break;
    }
    
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter text to get " + (activeTab === "recommend" ? "recommendations" : activeTab === "analyze" ? "analysis" : "trivia"),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setExtractedTitles([]);
    
    try {
      const result = await aiFunction(inputText);
      setResponse(result);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: `Failed to generate ${activeTab === "recommend" ? "recommendations" : activeTab === "analyze" ? "analysis" : "trivia"}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    switch (activeTab) {
      case "recommend":
        setPrompt(example);
        break;
      case "analyze":
        setWatchHistory(example);
        break;
      case "trivia":
        setMediaTitle(example);
        break;
    }
  };

  const handleTitleCardClick = (item: ExtractedTitle) => {
    if (item.id) {
      navigate(`/${item.type}/${item.id}`);
    } else {
      // If we don't have an ID, let's search for it
      navigate(`/search?q=${encodeURIComponent(item.title)}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl overflow-hidden border border-primary/20 bg-black/40 backdrop-blur-lg p-4 md:p-6 neo-blur"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="p-1.5 md:p-2 rounded-full bg-primary/20">
              <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">MovieMind AI Assistant</h2>
          </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 md:mb-6 h-auto p-1 bg-black/40">
            <TabsTrigger value="recommend" className="flex gap-1 md:gap-2 items-center text-xs md:text-sm p-2 md:p-3">
              <Film className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Recommendations</span>
              <span className="sm:hidden">Rec</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex gap-1 md:gap-2 items-center text-xs md:text-sm p-2 md:p-3">
              <History className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Analyze History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="trivia" className="flex gap-1 md:gap-2 items-center text-xs md:text-sm p-2 md:p-3">
              <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Movie Trivia</span>
              <span className="sm:hidden">Trivia</span>
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <TabsContent value="recommend">
              <div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What kind of movies or TV shows would you like to watch?"
                  className="min-h-32 bg-black/30 border-white/10 focus:border-primary"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 my-2">
                <p className="text-sm text-muted-foreground w-full mb-1">Try these examples:</p>
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="bg-black/30 border-white/10 text-xs hover:bg-primary/20 hover:text-primary transition-all text-white/70"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="analyze">
              <div>
                <Textarea
                  value={watchHistory}
                  onChange={(e) => setWatchHistory(e.target.value)}
                  placeholder="Enter your watch history (comma-separated list of movies/shows you've watched)"
                  className="min-h-32 bg-black/30 border-white/10 focus:border-primary"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 my-2">
                <p className="text-sm text-muted-foreground w-full mb-1">Try these examples:</p>
                {HISTORY_EXAMPLES.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="bg-black/30 border-white/10 text-xs hover:bg-primary/20 hover:text-primary transition-all text-white/70"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="trivia">
              <div>
                <Textarea
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                  placeholder="Enter a movie or TV show title to get interesting trivia"
                  className="min-h-32 bg-black/30 border-white/10 focus:border-primary"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 my-2">
                <p className="text-sm text-muted-foreground w-full mb-1">Try these examples:</p>
                {TRIVIA_EXAMPLES.map((example, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="bg-black/30 border-white/10 text-xs hover:bg-primary/20 hover:text-primary transition-all text-white/70"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {activeTab === "recommend" ? "Generating..." : activeTab === "analyze" ? "Analyzing..." : "Finding trivia..."}
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="h-4 w-4" />
                    {activeTab === "recommend" ? "Get Recommendations" : activeTab === "analyze" ? "Analyze History" : "Get Trivia"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
        
        {response && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-black/50 rounded-lg p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              {activeTab === "recommend" ? (
                <Popcorn className="h-5 w-5 text-primary" />
              ) : activeTab === "analyze" ? (
                <PanelTop className="h-5 w-5 text-primary" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary" />
              )}
              <h3 className="text-lg font-medium">
                {activeTab === "recommend" ? "Your Recommendations" : activeTab === "analyze" ? "Analysis Results" : "Movie Trivia"}
              </h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {response}
              </div>
            </div>
            
            {/* Extracted movie/show cards */}
            {(extractedTitles.length > 0 || isSearchingTitles) && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Suggested Titles</h3>
                </div>
                
                {isSearchingTitles ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4"
                  >
                    {extractedTitles.map((item, index) => (
                      <motion.div 
                        key={`${item.title}-${index}`} 
                        variants={itemVariants}
                        className="cursor-pointer"
                        onClick={() => handleTitleCardClick(item)}
                      >
                        <Card className="h-full bg-black/50 border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden hover:shadow-[0_0_15px_rgba(147,51,234,0.15)]">
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="aspect-[2/3] w-full mb-3 overflow-hidden rounded-md bg-black/50">
                              {item.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} 
                                  alt={item.title}
                                  className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/50 text-white/30">
                                  <Film size={40} />
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium line-clamp-1 text-sm">{item.title}</h4>
                            <div className="flex mt-1 text-xs text-muted-foreground">
                              <span className="uppercase">{item.type}</span>
                              {item.year && <span className="ml-2">{item.year}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
        </motion.div>
      </div>
    </div>
  );
};

export default AIRecommendations;
