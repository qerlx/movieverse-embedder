
import React, { useState } from "react";
import { generateAIRecommendations } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  CornerDownLeft, 
  Loader2, 
  Popcorn,
  Film,
  HeartHandshake
} from "lucide-react";
import { motion } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "Recommend movies similar to 'Eternal Sunshine of the Spotless Mind'",
  "What are some good sci-fi TV shows with strong female leads?",
  "I enjoy psychological thrillers with plot twists. What should I watch?",
  "Recommend me uplifting movies that aren't too cheesy",
  "What are some good animated films for adults?"
];

const AIRecommendations: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to get recommendations",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await generateAIRecommendations(prompt);
      setResponse(result);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl overflow-hidden border border-primary/20 bg-black/40 backdrop-blur-lg p-6 neo-blur"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">AI Movie Recommendations</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CornerDownLeft className="h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>
        </form>
        
        {response && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-black/50 rounded-lg p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Popcorn className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Your Recommendations</h3>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {response}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by Llama 4 AI. Results may vary and are based on the AI's knowledge.
        </p>
      </div>
    </div>
  );
};

export default AIRecommendations;
