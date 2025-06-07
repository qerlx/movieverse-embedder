
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { LogOut, User, Heart, Clock } from "lucide-react";
import Favorites from "@/components/Favorites";
import RecentlyWatched from "@/components/RecentlyWatched";

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-1/4 bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-4">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || "User"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <User size={32} />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">
              {currentUser.displayName || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart size={16} />
                <span>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock size={16} />
                <span>Recently Watched</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="favorites">
              <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
              <Favorites />
            </TabsContent>
            <TabsContent value="history">
              <h2 className="text-2xl font-bold mb-6">Recently Watched</h2>
              <RecentlyWatched />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
