
import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Film, Tv, Home, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./ui/logo";
import SearchBar from "./SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
            <Logo />
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-2">
                <NavItems />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SearchBar />
            {isMobile && (
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
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 mt-16 mb-16 md:mb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
