import { useState, useEffect, useCallback } from 'react';

export const useDebouncedSearch = (
  searchFunction: (query: string) => Promise<any>,
  delay: number = 300
) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    let isCancelled = false;

    const executeSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        if (!isCancelled) {
          setResults(searchResults);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Search failed');
          setResults(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    executeSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, searchFunction]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults(null);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    isLoading,
    results,
    error,
    clearSearch,
  };
};