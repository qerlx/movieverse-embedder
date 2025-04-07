
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Film, Tv, Home, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./ui/logo";
import SearchBar from "./SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import MobileNavigation from "./MobileNavigation";
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
  const { theme } = useTheme();

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

  const isNetflix = theme === 'netflix';
  
  const NavItems = () => {
    // Generate style based on theme
    const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
      // Netflix style
      if (isNetflix) {
        return cn(
          "flex items-center gap-2 px-3 py-2 transition-all duration-200 text-sm font-medium",
          isActive
            ? "text-white"
            : "text-gray-300 hover:text-white"
        );
      }
      
      // Default style
      return cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-white hover:bg-muted/30"
      );
    };
    
    return (
      <>
        <NavLink to="/" className={getLinkStyle}>
          <Home size={isNetflix ? 16 : 18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/movies" className={getLinkStyle}>
          <Film size={isNetflix ? 16 : 18} />
          <span>Movies</span>
        </NavLink>
        <NavLink to="/tv-shows" className={getLinkStyle}>
          <Tv size={isNetflix ? 16 : 18} />
          <span>TV Shows</span>
        </NavLink>
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
          "fixed top-0 left-0 right-0 z-50 nav-blur transition-transform duration-300",
          !showNavbar && !mobileMenuOpen && "-translate-y-full",
          isNetflix && "bg-black/95 border-b border-gray-900/50"
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
            
            {/* Theme Switcher */}
            {!searchExpanded && (
              <div className={`transition-opacity duration-300 ${searchExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                <ThemeSwitcher />
              </div>
            )}
          </div>
        </div>
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
      {isMobile && <MobileNavigation />}
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Layout;
