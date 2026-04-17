
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PStreamNav from "./PStreamNav";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavigation from "./MobileNavigation";

const Layout: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Hide chrome on watch routes
  if (location.pathname.includes("/watch/")) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PStreamNav />
      <main className="flex-1 pt-14 md:pt-16 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;

