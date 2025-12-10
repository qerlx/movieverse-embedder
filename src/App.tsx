
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageTransitionProvider } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import DnsPopup from "./components/DnsPopup";

// Optimized lazy loaded components with preloading hints
const Movies = lazy(() => import(/* webpackChunkName: "pages-movies" */ "./pages/Movies"));
const TVShows = lazy(() => import(/* webpackChunkName: "pages-tv" */ "./pages/TVShows"));
const MovieDetail = lazy(() => import(/* webpackChunkName: "pages-detail" */ "./pages/MovieDetail"));
const TVShowDetail = lazy(() => import(/* webpackChunkName: "pages-detail" */ "./pages/TVShowDetail"));
const Search = lazy(() => import(/* webpackChunkName: "pages-search" */ "./pages/Search"));
const UserProfile = lazy(() => import(/* webpackChunkName: "pages-profile" */ "./pages/UserProfile"));
const Collections = lazy(() => import(/* webpackChunkName: "pages-collections" */ "./pages/Collections"));
const CollectionDetail = lazy(() => import(/* webpackChunkName: "pages-collections" */ "./pages/CollectionDetail"));
const AIRecommendations = lazy(() => import(/* webpackChunkName: "components-ai" */ "./components/AIRecommendations"));
const AIAutomation = lazy(() => import(/* webpackChunkName: "components-ai" */ "./components/AIAutomation"));
const Providers = lazy(() => import(/* webpackChunkName: "pages-providers" */ "./pages/Providers"));
const ProviderDetail = lazy(() => import(/* webpackChunkName: "pages-providers" */ "./pages/ProviderDetail"));

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
          <Route path="providers" element={
            <Suspense fallback={<PageLoader />}><Providers /></Suspense>
          } />
          <Route path="provider/:providerId" element={
            <Suspense fallback={<PageLoader />}><ProviderDetail /></Suspense>
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
      retry: (failureCount, error) => failureCount < 2,
      staleTime: 1000 * 60 * 10, // 10 minutes - longer stale time
      gcTime: 1000 * 60 * 60, // 1 hour - longer garbage collection
      refetchOnReconnect: 'always',
      refetchInterval: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  console.log("App component rendering");
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <PageTransitionProvider>
                  <AnimatedRoutes />
                  <DnsPopup />
                </PageTransitionProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-red-500">Something went wrong loading the application.</p>
        </div>
      </div>
    );
  }
};

export default App;
