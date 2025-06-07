
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
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

const StreamingProviders: React.FC = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch streaming providers on component mount
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
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [toast]);

  // Navigate to provider detail page
  const handleProviderClick = (provider: Provider) => {
    navigate(`/provider/${provider.id}`);
  };

  const renderProviderCard = (provider: Provider) => {
    const hasLogo = provider.logo_100px;
    
    return (
      <motion.div
        key={provider.id}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0"
      >
        <Card 
          className="h-32 w-40 cursor-pointer bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
          onClick={() => handleProviderClick(provider)}
        >
          <CardContent className="p-4 h-full flex flex-col items-center justify-center relative">
            {hasLogo ? (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={provider.logo_100px}
                  alt={provider.name}
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
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
                <div className="fallback-logo w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300" style={{ display: 'none' }}>
                  <span className="text-white font-bold text-lg">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-center font-medium text-white line-clamp-2">
                  {provider.name}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-center font-medium text-white line-clamp-2">
                  {provider.name}
                </span>
              </div>
            )}
            
            {/* Hover indicator */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">Browse by Streaming Service</h2>
        <div className="flex items-center justify-center py-12 text-red-400">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Browse by Streaming Service</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/providers')}
          className="hidden sm:flex"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* Provider cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {providers.map(renderProviderCard)}
      </div>
      
      {/* Mobile view all button */}
      <div className="mt-4 sm:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/providers')}
          className="w-full"
        >
          View All Providers
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default StreamingProviders;
