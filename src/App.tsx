import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from "react-query";
import { Toaster } from "sonner";
import { QueryClientProvider } from "react-query";

import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Movies from '@/pages/Movies';
import TVShows from '@/pages/TVShows';
import Search from '@/pages/Search';
import MovieDetail from '@/pages/MovieDetail';
import TVShowDetail from '@/pages/TVShowDetail';
import Collections from '@/pages/Collections';
import Watch from '@/pages/Watch';
import UserProfile from '@/pages/UserProfile';
import NotFound from '@/pages/NotFound';
import CollectionDetail from "@/pages/CollectionDetail";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="movies" element={<Movies />} />
                <Route path="tv-shows" element={<TVShows />} />
                <Route path="search" element={<Search />} />
                <Route path="movie/:id" element={<MovieDetail />} />
                <Route path="tv/:id" element={<TVShowDetail />} />
                <Route path="collections" element={<Collections />} />
                <Route path="collection/:id" element={<CollectionDetail />} />
                <Route path="watch/movie/:id" element={<Watch />} />
                <Route path="watch/tv/:id/:season/:episode" element={<Watch />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
