
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Film, Tv, Home, Menu, Search, User, Heart, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./ui/logo";
import SearchBar from "./SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";

const Layout = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Handle navbar hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80) {
        if (currentScrollY > lastScrollY) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Listen for search bar expansion events
  useEffect(() => {
    const handleSearchToggle = (e: CustomEvent) => {
      setSearchExpanded(e.detail.expanded);
    };

    document.addEventListener('searchBarExpandToggle', handleSearchToggle as EventListener);
    return () => {
      document.removeEventListener('searchBarExpandToggle', handleSearchToggle as EventListener);
    };
  }, []);
  
  const NavItems = () => {
    // Generate style based on theme
    const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
      return cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-white hover:bg-muted/30"
      );
    };
    
    return (
      <>
        <NavLink to="/" className={getLinkStyle}>
          <Home size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/movies" className={getLinkStyle}>
          <Film size={18} />
          <span>Movies</span>
        </NavLink>
        <NavLink to="/tv-shows" className={getLinkStyle}>
          <Tv size={18} />
          <span>TV Shows</span>
        </NavLink>
        {currentUser && (
          <>
            <NavLink to="/profile" className={getLinkStyle}>
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </>
        )}
      </>
    );
  };

  // Display only the content on the watch pages
  if (location.pathname.includes('/watch/')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
          !showNavbar && !mobileMenuOpen && "-translate-y-full",
          "bg-background/80 backdrop-blur-md border-b border-border/40"
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {isMobile && searchExpanded ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/caa73530-a5df-42b6-967d-52fda023811b.png" 
                  alt="MovieStreamHub" 
                  className="w-8 h-8 object-contain animate-scale-in" 
                />
              </div>
            ) : (
              <div className={`transition-all duration-300 ${isMobile && searchExpanded ? 'opacity-0 scale-0 w-0' : 'opacity-100 animate-fade-in'}`}>
                <Logo />
              </div>
            )}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-2">
                <NavItems />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SearchBar />
            
            {/* Auth Button or User Menu */}
            {!searchExpanded && !currentUser && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAuthModalOpen(true)}
                className="text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full transition-all"
              >
                Sign In
              </motion.button>
            )}
            
            {!searchExpanded && currentUser && (
              <NavLink 
                to="/profile" 
                className="flex items-center gap-2 hover:bg-muted/20 px-3 py-1.5 rounded-full transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName || ""} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {currentUser.displayName || "Profile"}
                </span>
              </NavLink>
            )}
            
            {/* Mobile Menu Toggle */}
            {isMobile && !searchExpanded && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full hover:bg-muted/20"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-background border-t border-border/30"
            >
              <nav className="container mx-auto p-4 flex flex-col gap-1">
                <NavItems />
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 mt-16 mb-16 md:mb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/40 shadow-lg h-16"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full grid grid-cols-4 gap-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </NavLink>
            
            <NavLink 
              to="/search" 
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Search size={20} />
              <span className="text-xs mt-1">Search</span>
            </NavLink>
            
            {currentUser ? (
              <NavLink 
                to="/profile" 
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <User size={20} />
                <span className="text-xs mt-1">Profile</span>
              </NavLink>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex flex-col items-center justify-center text-muted-foreground"
              >
                <User size={20} />
                <span className="text-xs mt-1">Sign In</span>
              </button>
            )}
            
            <NavLink 
              to={currentUser ? "/profile?tab=favorites" : "/movies"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {currentUser ? (
                <>
                  <Heart size={20} />
                  <span className="text-xs mt-1">Favorites</span>
                </>
              ) : (
                <>
                  <Film size={20} />
                  <span className="text-xs mt-1">Movies</span>
                </>
              )}
            </NavLink>
          </div>
        </motion.div>
      )}
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Layout;
