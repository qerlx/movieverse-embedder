
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const API_KEY = 'JEIxcWMvFnCX3JPkRWzeoPKDsoZsSkFYcwQVDruJ';

// Logo mapping for popular providers
const providerLogos = {
  203: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg',
  157: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  387: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Hulu_Logo.svg',
  248: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/HBO_Max_Logo.svg'
};

interface Provider {
  id: number;
  name: string;
  type: string;
}

interface Title {
  id: number;
  title: string;
  poster: string;
  year: number;
  type: string;
  imdb_id?: string;
}

const StreamingProviders: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch streaming providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoadingProviders(true);
        setError(null);
        
        const response = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${API_KEY}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter to show only major streaming services
        const streamingProviders = data.filter((provider: Provider) => 
          provider.type === 'sub' || [203, 157, 387, 248].includes(provider.id)
        ).slice(0, 12); // Limit to 12 providers for better UI
        
        setProviders(streamingProviders);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setError('Failed to load streaming providers');
        toast({
          title: 'Error',
          description: 'Failed to load streaming providers',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [toast]);

  // Fetch titles for selected provider
  const handleProviderClick = async (provider: Provider) => {
    try {
      setIsLoadingTitles(true);
      setSelectedProvider(provider);
      setTitles([]);
      setError(null);

      const response = await fetch(
        `https://api.watchmode.com/v1/list-titles/?apiKey=${API_KEY}&source_ids=${provider.id}&limit=50`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch titles: ${response.status}`);
      }

      const data = await response.json();
      setTitles(data.titles || data || []);

      if (!data.titles && !data.length) {
        toast({
          title: 'No content found',
          description: `No titles available for ${provider.name}`,
        });
      }
    } catch (error) {
      console.error('Error fetching titles:', error);
      setError(`Failed to load content for ${provider.name}`);
      toast({
        title: 'Error',
        description: `Failed to load content for ${provider.name}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const renderProviderButton = (provider: Provider) => {
    const hasLogo = providerLogos[provider.id as keyof typeof providerLogos];
    
    return (
      <motion.div
        key={provider.id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0"
      >
        <Button
          onClick={() => handleProviderClick(provider)}
          variant="outline"
          className={`h-20 w-32 p-2 bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all duration-300 ${
            selectedProvider?.id === provider.id ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          {hasLogo ? (
            <div className="flex flex-col items-center space-y-1">
              <img
                src={providerLogos[provider.id as keyof typeof providerLogos]}
                alt={provider.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.textContent = provider.name;
                }}
              />
              <span className="text-xs text-center line-clamp-2">{provider.name}</span>
            </div>
          ) : (
            <span className="text-xs text-center font-medium">{provider.name}</span>
          )}
        </Button>
      </motion.div>
    );
  };

  if (isLoadingProviders) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Browse by Streaming Service</h2>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">Loading providers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Browse by Streaming Service</h2>
      
      {/* Provider buttons */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {providers.map(renderProviderButton)}
      </div>

      {/* Selected provider content */}
      {selectedProvider && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Content from {selectedProvider.name}
          </h3>

          {isLoadingTitles ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <span className="ml-2 text-muted-foreground">Loading content...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : titles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No content available for this provider
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
            >
              {titles.map((title) => (
                <motion.div
                  key={title.id}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden bg-black/30 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <img
                          src={title.poster || '/placeholder.svg'}
                          alt={title.title}
                          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/placeholder.svg') {
                              target.src = '/placeholder.svg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs font-medium line-clamp-2">{title.title}</p>
                          {title.year && (
                            <p className="text-xs text-gray-300">{title.year}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamingProviders;
