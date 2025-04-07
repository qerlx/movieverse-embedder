
import React, { useEffect, useState } from 'react';
import { getWatchProviders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WatchProvidersProps {
  id: number;
  type: 'movie' | 'tv';
  className?: string;
}

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

type ProviderData = {
  link: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
};

const WatchProviders: React.FC<WatchProvidersProps> = ({ id, type, className }) => {
  const [providers, setProviders] = useState<Record<string, ProviderData> | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const data = await getWatchProviders(type, id);
        
        if (data && data.results) {
          setProviders(data.results);
          setCountries(Object.keys(data.results).sort());
          
          // Try to set user's country as default, fallback to US
          const userCountry = navigator.language?.split('-')[1] || 'US';
          if (data.results[userCountry]) {
            setSelectedCountry(userCountry);
          } else if (data.results['US']) {
            setSelectedCountry('US');
          } else if (Object.keys(data.results).length > 0) {
            setSelectedCountry(Object.keys(data.results)[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching watch providers:', error);
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
  }, [id, type, toast]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-5 w-32 bg-muted/30 rounded"></div>
        <div className="flex space-x-2">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-10 w-10 bg-muted/30 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!providers || Object.keys(providers).length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No streaming information available
      </div>
    );
  }

  const selectedProviders = providers[selectedCountry];
  
  const renderProviderSection = (title: string, providerList?: Provider[]) => {
    if (!providerList || providerList.length === 0) return null;
    
    return (
      <div>
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {providerList.map(provider => (
            <div 
              key={provider.provider_id} 
              className="flex flex-col items-center"
              title={provider.provider_name}
            >
              <img 
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-8 h-8 object-cover rounded"
                loading="lazy"
              />
              <span className="text-xs text-muted-foreground mt-1 max-w-[50px] truncate">
                {provider.provider_name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Watch Options</h3>
        {countries.length > 1 && (
          <select 
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="text-xs bg-muted/20 border border-muted/30 rounded px-2 py-1"
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="space-y-4">
        {renderProviderSection("Stream", selectedProviders.flatrate)}
        {renderProviderSection("Rent", selectedProviders.rent)}
        {renderProviderSection("Buy", selectedProviders.buy)}
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        <a 
          href={selectedProviders.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          More info on JustWatch
        </a>
      </div>
    </div>
  );
};

export default WatchProviders;
