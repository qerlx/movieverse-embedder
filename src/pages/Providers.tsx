
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Tv, Film, Star, Calendar } from 'lucide-react';

const API_KEY = 'JEIxcWMvFnCX3JPkRWzeoPKDsoZsSkFYcwQVDruJ';

// Map of popular provider IDs to logos
const providerLogos: Record<number, string> = {
  203: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg',
  157: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  387: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Hulu_Logo.svg',
  248: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/HBO_Max_Logo.svg',
  15: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
  386: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Peacock_logo.svg',
  531: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Paramount_Plus_logo.svg',
};

interface Provider {
  id: number;
  name: string;
  logo_100px?: string;
}

interface Title {
  id: number;
  title: string;
  type: string;
  year?: number;
  imdb_id?: string;
  tmdb_id?: number;
  poster?: string;
  plot_overview?: string;
  genre_names?: string[];
  user_rating?: number;
}

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const { toast } = useToast();

  // Fetch all streaming providers
  const loadProviders = async () => {
    try {
      setIsLoadingProviders(true);
      const response = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Providers data:', data);
      
      // Filter to show only popular providers that have logos
      const popularProviders = data.filter((provider: Provider) => 
        providerLogos[provider.id] || provider.logo_100px
      );
      
      setProviders(popularProviders.slice(0, 12)); // Limit to 12 providers
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load streaming providers. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  // Fetch titles for a specific provider
  const loadTitlesForProvider = async (provider: Provider) => {
    try {
      setIsLoadingTitles(true);
      setSelectedProvider(provider);
      setTitles([]);

      const response = await fetch(
        `https://api.watchmode.com/v1/list-titles/?apiKey=${API_KEY}&source_ids=${provider.id}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Titles data:', data);
      
      if (Array.isArray(data)) {
        setTitles(data);
      } else {
        setTitles([]);
        toast({
          title: 'No Content',
          description: `No titles found for ${provider.name}.`,
        });
      }
    } catch (error) {
      console.error('Error loading titles:', error);
      toast({
        title: 'Error',
        description: `Failed to load content from ${provider.name}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTitles(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Browse by Streaming Service
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover content from your favorite streaming platforms. Click on any provider to see their full catalog.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Providers Grid */}
        {!selectedProvider && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-bold text-center mb-8"
            >
              Choose a Streaming Service
            </motion.h2>

            {isLoadingProviders ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Card key={index} className="aspect-square animate-pulse">
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 bg-muted/30 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
              >
                {providers.map((provider) => (
                  <motion.div key={provider.id} variants={itemVariants}>
                    <Card 
                      className="aspect-square cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                      onClick={() => loadTitlesForProvider(provider)}
                    >
                      <CardContent className="flex flex-col items-center justify-center h-full p-4">
                        {providerLogos[provider.id] ? (
                          <img
                            src={providerLogos[provider.id]}
                            alt={provider.name}
                            className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : provider.logo_100px ? (
                          <img
                            src={provider.logo_100px}
                            alt={provider.name}
                            className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                            <Tv className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <h3 className="text-center text-sm font-medium group-hover:text-primary transition-colors duration-300">
                          {provider.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Selected Provider Content */}
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Provider Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProvider(null);
                  setTitles([]);
                }}
              >
                ← Back to Providers
              </Button>
              <div className="flex items-center gap-4">
                {providerLogos[selectedProvider.id] ? (
                  <img
                    src={providerLogos[selectedProvider.id]}
                    alt={selectedProvider.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Tv className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">{selectedProvider.name}</h2>
                  <p className="text-muted-foreground">
                    {titles.length} titles available
                  </p>
                </div>
              </div>
            </div>

            {/* Titles Grid */}
            {isLoadingTitles ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {Array.from({ length: 24 }).map((_, index) => (
                  <Card key={index} className="aspect-[2/3] animate-pulse">
                    <CardContent className="p-0 h-full">
                      <div className="w-full h-3/4 bg-muted/30 rounded-t-lg"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted/30 rounded"></div>
                        <div className="h-3 bg-muted/30 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : titles.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
              >
                {titles.map((title) => (
                  <motion.div key={title.id} variants={itemVariants}>
                    <Card className="aspect-[2/3] group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardContent className="p-0 h-full flex flex-col">
                        {title.poster ? (
                          <img
                            src={title.poster}
                            alt={title.title}
                            className="w-full h-3/4 object-cover rounded-t-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-3/4 bg-muted/20 rounded-t-lg flex items-center justify-center">
                            {title.type === 'movie' ? (
                              <Film className="w-12 h-12 text-muted-foreground" />
                            ) : (
                              <Tv className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
                              {title.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {title.year && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {title.year}
                                </span>
                              )}
                              {title.user_rating && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {title.user_rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          {title.genre_names && title.genre_names.length > 0 && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {title.genre_names[0]}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No titles found for this provider.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Providers;
