
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "./ui/logo";
import { LogIn, Mail, User, Lock } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const { signInWithGoogle, signInWithEmail, createAccount, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("signin");

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Only close if successful
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email, password);
    // Only close if successful
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAccount(email, password);
    // Only close if successful
    if (!loading) {
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <Logo iconOnly />
          </div>
          <DialogTitle className="text-xl text-center">Welcome to MovieStreamHub</DialogTitle>
          <DialogDescription className="text-center">
            Track your watched shows, save your progress, and sync across devices.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signin" value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          resetForm();
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="youremail@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-5"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleSignIn} 
              className="flex items-center gap-2 w-full py-5 relative overflow-hidden group"
              variant="outline"
              disabled={loading}
            >
              <div className="absolute inset-0 w-3 bg-primary group-hover:w-full transition-all duration-300 ease-out opacity-10"></div>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909a7.12 7.12 0 0 1 5.051 2.085l3.95-3.95A12.147 12.147 0 0 0 12 0C7.392 0 3.365 2.745 1.322 6.915l3.944 2.85z" />
                    <path fill="#34A853" d="M16.041 18.013C14.951 18.716 13.566 19.09 12 19.09c-3.212 0-5.929-2.091-6.901-5.01L1.254 16.944C3.308 21.236 7.304 24 12 24c3.259 0 6.195-1.145 8.335-3.010l-4.294-2.977z" />
                    <path fill="#4A90E2" d="M19.834 11.23c.178.661.271 1.354.271 2.061 0 .629-.085 1.237-.245 1.814-.477 1.723-1.464 3.227-2.779 4.337l4.294 2.977c1.893-1.754 3.208-4.158 3.624-6.855H20.45v-4.334h8.388C28.944 3.941 21.886 0 12 0v4.909c3.85 0 7.41 1.395 10.145 3.709l-2.311 2.612z" />
                    <path fill="#FBBC05" d="M5.099 14.08C4.915 13.43 4.815 12.742 4.815 12c0-.742.1-1.43.284-2.08l-3.776-2.853C.663 8.957 0 10.43 0 12s.663 3.043 1.322 3.933l3.777-2.853z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="youremail@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-5"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleSignIn} 
              className="flex items-center gap-2 w-full py-5 relative overflow-hidden group"
              variant="outline"
              disabled={loading}
            >
              <div className="absolute inset-0 w-3 bg-primary group-hover:w-full transition-all duration-300 ease-out opacity-10"></div>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909a7.12 7.12 0 0 1 5.051 2.085l3.95-3.95A12.147 12.147 0 0 0 12 0C7.392 0 3.365 2.745 1.322 6.915l3.944 2.85z" />
                    <path fill="#34A853" d="M16.041 18.013C14.951 18.716 13.566 19.09 12 19.09c-3.212 0-5.929-2.091-6.901-5.01L1.254 16.944C3.308 21.236 7.304 24 12 24c3.259 0 6.195-1.145 8.335-3.010l-4.294-2.977z" />
                    <path fill="#4A90E2" d="M19.834 11.23c.178.661.271 1.354.271 2.061 0 .629-.085 1.237-.245 1.814-.477 1.723-1.464 3.227-2.779 4.337l4.294 2.977c1.893-1.754 3.208-4.158 3.624-6.855H20.45v-4.334h8.388C28.944 3.941 21.886 0 12 0v4.909c3.85 0 7.41 1.395 10.145 3.709l-2.311 2.612z" />
                    <path fill="#FBBC05" d="M5.099 14.08C4.915 13.43 4.815 12.742 4.815 12c0-.742.1-1.43.284-2.08l-3.776-2.853C.663 8.957 0 10.43 0 12s.663 3.043 1.322 3.933l3.777-2.853z" />
                  </svg>
                  <span>Sign up with Google</span>
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-3 text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
