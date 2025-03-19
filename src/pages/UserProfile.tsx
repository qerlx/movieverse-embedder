
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Heart } from "lucide-react";
import Favorites from "@/components/Favorites";

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You need to sign in</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User profile header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
          <AvatarFallback>
            {currentUser.displayName
              ? currentUser.displayName.charAt(0).toUpperCase()
              : currentUser.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
            {currentUser.displayName || "User"}
          </h1>
          <p className="text-muted-foreground mb-4 text-center md:text-left">
            {currentUser.email}
          </p>

          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Content tabs */}
      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart size={16} />
            Favorites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="space-y-4">
          <h2 className="text-2xl font-bold">Your Favorites</h2>
          <Favorites />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
