
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/MovieCard';
import { useToast } from '@/hooks/use-toast';
import { getPopularMovies, getPopularTVShows } from '@/lib/api';

const API_KEY = 'JEIxcWMvFnCX3JPkRWzeoPKDsoZsSkFYcwQVDruJ';

// Provider logos mapping
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

const ProviderDetail: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [tvShows, setTVShows] = useState<any[]>([]);
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    const fetchProviderAndContent = async () => {
      if (!providerId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch provider info
        const providersResponse = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${API_KEY}`);
        const providers = await providersResponse.json();
        const currentProvider = providers.find((p: Provider) => p.id === parseInt(providerId));
        
        if (!currentProvider) {
          throw new Error('Provider not found');
        }
        
        setProvider(currentProvider);
        
        // For now, we'll show popular content since the Watchmode API titles endpoint
        // doesn't return TMDB IDs consistently. In a real app, you'd need a mapping service.
        const [moviesData, tvData] = await Promise.all([
          getPopularMovies(),
          getPopularTVShows()
        ]);
        
        setMovies(moviesData.results || []);
        setTVShows(tvData.results || []);
        
      } catch (error) {
        console.error('Error fetching provider data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load provider content',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderAndContent();
  }, [providerId, toast]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredContent([...movies, ...tvShows]);
    } else if (filter === 'movie') {
      setFilteredContent(movies);
    } else {
      setFilteredContent(tvShows);
    }
  }, [filter, movies, tvShows]);

  const handleFilterChange = (newFilter: 'all' | 'movie' | 'tv') => {
    setFilter(newFilter);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-lg">Loading content...</span>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const providerLogo = providerLogos[provider.id as keyof typeof providerLogos];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center space-x-6">
            {providerLogo ? (
              <img
                src={providerLogo}
                alt={provider.name}
                className="w-16 h-16 object-contain bg-white rounded-lg p-2"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{provider.name.charAt(0)}</span>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {provider.name}
              </h1>
              <p className="text-white/80">
                {filteredContent.length} titles available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => handleFilterChange('all')}
            className="transition-all duration-300"
          >
            All ({movies.length + tvShows.length})
          </Button>
          <Button
            variant={filter === 'movie' ? 'default' : 'outline'}
            onClick={() => handleFilterChange('movie')}
            className="transition-all duration-300"
          >
            Movies ({movies.length})
          </Button>
          <Button
            variant={filter === 'tv' ? 'default' : 'outline'}
            onClick={() => handleFilterChange('tv')}
            className="transition-all duration-300"
          >
            TV Shows ({tvShows.length})
          </Button>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No {filter === 'all' ? 'content' : filter === 'movie' ? 'movies' : 'TV shows'} found for {provider.name}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          >
            {filteredContent.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.title || item.name}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <MovieCard
                  item={item}
                  type={item.title ? 'movie' : 'tv'}
                  priority={index < 12}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProviderDetail;
