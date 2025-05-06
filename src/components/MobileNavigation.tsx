
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Film, Tv, Search, User, FolderArchive } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const MobileNavigation = () => {
  const { currentUser } = useAuth();

  const getLinkStyle = ({ isActive }: { isActive: boolean }) => {
    return cn(
      "flex flex-col items-center justify-center text-xs font-medium py-2",
      isActive 
        ? "text-primary" 
        : "text-muted-foreground"
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 md:hidden">
      <div className="grid grid-cols-5 px-2">
        <NavLink to="/" className={getLinkStyle}>
          <Home size={20} className="mb-1" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/movies" className={getLinkStyle}>
          <Film size={20} className="mb-1" />
          <span>Movies</span>
        </NavLink>
        <NavLink to="/tv" className={getLinkStyle}>
          <Tv size={20} className="mb-1" />
          <span>TV</span>
        </NavLink>
        <NavLink to="/collections" className={getLinkStyle}>
          <FolderArchive size={20} className="mb-1" />
          <span>Collections</span>
        </NavLink>
        <NavLink to={currentUser ? "/profile" : "/search"} className={getLinkStyle}>
          {currentUser ? (
            <>
              <User size={20} className="mb-1" />
              <span>Profile</span>
            </>
          ) : (
            <>
              <Search size={20} className="mb-1" />
              <span>Search</span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default MobileNavigation;
