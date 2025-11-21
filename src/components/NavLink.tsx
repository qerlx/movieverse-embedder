import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  end?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ 
  to, 
  className, 
  activeClassName = "active", 
  end = false,
  children,
  ...props 
}) => {
  const location = useLocation();
  const path = typeof to === "string" ? to : to.pathname || "";
  
  const isActive = end 
    ? location.pathname === path 
    : location.pathname.startsWith(path);

  return (
    <Link
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;
