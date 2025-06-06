import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const API_KEY = 'JEIxcWMvFnCX3JPkRWzeoPKDsoZsSkFYcwQVDruJ';

interface Provider {
  id: number;
  name: string;
  logo_100px: string;
  type: string;
}

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${API_KEY}`);
        const data = await res.json();
        setProviders(data);
      } catch (err) {
        console.error('Error loading providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        <span className="ml-2">Loading providers...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Streaming Providers</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {providers.map(provider => (
          <motion.button
            key={provider.id}
            onClick={() => navigate(`/provider/${provider.id}`)}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-col items-center justify-center hover:bg-zinc-800 transition"
          >
            {provider.logo_100px ? (
              <img
                src={provider.logo_100px}
                alt={provider.name}
                className="w-12 h-12 object-contain mb-2"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded mb-2 text-white font-bold text-xl">
                {provider.name.charAt(0)}
              </div>
            )}
            <span className="text-white text-sm text-center">{provider.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Providers;
