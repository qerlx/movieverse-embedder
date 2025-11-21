
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { LogOut, User, Heart, Clock, Film, Tv } from "lucide-react";
import FavoritesList from "@/components/FavoritesList";
import WatchHistoryList from "@/components/WatchHistoryList";
import { useQuery } from "@tanstack/react-query";
import { storageService } from "@/lib/storage-service";
import UserStats from "@/components/enhanced/UserStats";
import { motion } from "framer-motion";

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user statistics
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", currentUser?.uid],
    queryFn: () => storageService.getFavorites(currentUser || undefined),
    enabled: !!currentUser,
    staleTime: 1000 * 60,
  });

  const { data: recentlyWatched = [] } = useQuery({
    queryKey: ["recentlyWatched", currentUser?.uid],
    queryFn: () => storageService.getRecentlyWatched(currentUser || undefined, 100),
    enabled: !!currentUser,
    staleTime: 1000 * 60,
  });

  // Calculate additional stats
  const movieCount = favorites.filter(f => f.mediaType === "movie").length;
  const tvCount = favorites.filter(f => f.mediaType === "tv").length;
  const watchedThisWeek = recentlyWatched.filter(w => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return w.lastWatched > weekAgo;
  }).length;

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground">Manage your account and track your viewing activity</p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <UserStats favorites={favorites} recentlyWatched={recentlyWatched} />
        </motion.div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-primary/20 shadow-2xl">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || "User"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentUser.displayName || "Anonymous User"}
                  </h2>
                  <p className="text-muted-foreground mb-1">{currentUser.email}</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Active
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Heart size={12} className="text-primary" />
                      Favorites
                    </div>
                    <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{favorites.length}</div>
                    <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Film size={10} />{movieCount}</span>
                      <span className="flex items-center gap-1"><Tv size={10} />{tvCount}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-3 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock size={12} className="text-blue-500" />
                      Watched
                    </div>
                    <div className="text-2xl font-bold text-blue-500 group-hover:scale-110 transition-transform">{recentlyWatched.length}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {watchedThisWeek} this week
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Signing Out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-2/3"
          >
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-background/50 backdrop-blur border border-border/50">
                <TabsTrigger value="favorites" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Heart size={16} />
                  <span>Favorites</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Clock size={16} />
                  <span>Recently Watched</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="favorites" className="space-y-6">
                <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Your Favorites</h2>
                      <p className="text-muted-foreground">Movies and shows you love</p>
                    </div>
                  </div>
                  <FavoritesList />
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Watch History</h2>
                      <p className="text-muted-foreground">All your viewing activity</p>
                    </div>
                  </div>
                  <WatchHistoryList />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
