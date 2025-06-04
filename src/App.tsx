import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import DnsPopup from "./components/DnsPopup";

// Lazy loaded components for better performance
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const TVShowDetail = lazy(() => import("./pages/TVShowDetail"));
const Search = lazy(() => import("./pages/Search"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const AIRecommendations = lazy(() => import("./components/AIRecommendations"));
const AIAutomation = lazy(() => import("./components/AIAutomation"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// AnimatePresence wrapper with location
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          <Route path="movies" element={
            <Suspense fallback={<PageLoader />}><Movies /></Suspense>
          } />
          <Route path="tv-shows" element={
            <Suspense fallback={<PageLoader />}><TVShows /></Suspense>
          } />
          <Route path="collections" element={
            <Suspense fallback={<PageLoader />}><Collections /></Suspense>
          } />
          <Route path="collections/:id" element={
            <Suspense fallback={<PageLoader />}><CollectionDetail /></Suspense>
          } />
          <Route path="movie/:id" element={
            <Suspense fallback={<PageLoader />}><MovieDetail /></Suspense>
          } />
          <Route path="tv/:id" element={
            <Suspense fallback={<PageLoader />}><TVShowDetail /></Suspense>
          } />
          <Route path="search" element={
            <Suspense fallback={<PageLoader />}><Search /></Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<PageLoader />}><UserProfile /></Suspense>
          } />
          <Route path="ai-recommendations" element={
            <Suspense fallback={<PageLoader />}><AIRecommendations /></Suspense>
          } />
          <Route path="ai-automation" element={
            <Suspense fallback={<PageLoader />}><AIAutomation /></Suspense>
          } />
        </Route>
        <Route path="/watch/:type/:id" element={<Watch />} />
        <Route path="/watch/:type/:id/:season/:episode" element={<Watch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Configure React Query for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (using gcTime instead of deprecated cacheTime)
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
            <DnsPopup />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
