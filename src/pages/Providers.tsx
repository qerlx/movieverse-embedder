
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const API_KEY = 'JEIxcWMvFnCX3JPkRWzeoPKDsoZsSkFYcwQVDruJ';

interface Provider {
  id: number;
  name: string;
  type: string;
  logo_100px?: string;
}

const Providers: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${API_KEY}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Show more providers on this dedicated page
        const streamingProviders = data.filter((provider: Provider) => 
          provider.type === 'sub' || provider.type === 'free'
        ).slice(0, 24);
        
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
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [toast]);

  const handleProviderClick = (provider: Provider) => {
    navigate(`/provider/${provider.id}`);
  };

  const renderProviderCard = (provider: Provider, index: number) => {
    const hasLogo = provider.logo_100px;
    
    return (
      <motion.div
        key={provider.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Card 
          className="h-40 cursor-pointer bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
          onClick={() => handleProviderClick(provider)}
        >
          <CardContent className="p-6 h-full flex flex-col items-center justify-center relative">
            {hasLogo ? (
              <div className="flex flex-col items-center space-y-3">
                <img
                  src={provider.logo_100px}
                  alt={provider.name}
                  className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // Show fallback when logo fails to load
                    const fallback = target.parentElement?.querySelector('.fallback-logo');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="fallback-logo w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300" style={{ display: 'none' }}>
                  <span className="text-white font-bold text-xl">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-center font-medium text-white line-clamp-2">
                  {provider.name}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-center font-medium text-white line-clamp-2">
                  {provider.name}
                </span>
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 rounded-full p-2">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-lg">Loading providers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Providers</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Streaming Providers</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
      >
        {providers.map(renderProviderCard)}
      </motion.div>
    </motion.div>
  );
};

export default Providers;
