
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { Film, Tv, Home, Menu, X, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./ui/logo";
import SearchBar from "./SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import ThemeSwitcher from "./ThemeSwitcher";

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

  const NavItems = () => (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-white hover:bg-muted/30"
          )
        }
      >
        <Home size={18} />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/movies"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-white hover:bg-muted/30"
          )
        }
      >
        <Film size={18} />
        <span>Movies</span>
      </NavLink>
      <NavLink
        to="/tv-shows"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-white hover:bg-muted/30"
          )
        }
      >
        <Tv size={18} />
        <span>TV Shows</span>
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 nav-blur transition-transform duration-300",
          !showNavbar && !mobileMenuOpen && "-translate-y-full"
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
            
            {/* User profile or login button */}
            {!searchExpanded && (
              <div className={`transition-opacity duration-300 ${searchExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {currentUser ? (
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 border border-primary/30 hover:border-primary transition-all">
                      <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-9 px-2 text-muted-foreground hover:text-white"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    <UserCircle size={20} className="mr-1.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                )}
              </div>
            )}
            
            {isMobile && !searchExpanded && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-md animate-fade-in">
            <nav className="flex flex-col p-4 gap-2">
              <NavItems />
              
              {!currentUser && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2 w-full justify-start gap-2"
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <UserCircle size={18} />
                  Sign In
                </Button>
              )}
              
              {currentUser && (
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-muted-foreground hover:text-white hover:bg-muted/30 mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>My Profile</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50">
          <div className="flex items-center justify-around h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-4 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Home size={20} />
              <span className="text-xs mt-1">Home</span>
            </NavLink>
            <NavLink
              to="/movies"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-4 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Film size={20} />
              <span className="text-xs mt-1">Movies</span>
            </NavLink>
            <NavLink
              to="/tv-shows"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-4 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Tv size={20} />
              <span className="text-xs mt-1">TV Shows</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-4 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <UserCircle size={20} />
              <span className="text-xs mt-1">Profile</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 mt-16 mb-16 md:mb-0">
        <Outlet />
      </main>
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Layout;
