
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "./ui/logo";
import { LogIn } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <Logo iconOnly />
          </div>
          <DialogTitle className="text-xl text-center">Sign in to MovieStreamHub</DialogTitle>
          <DialogDescription className="text-center">
            Track your watched shows, save your progress, and sync across devices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button 
            onClick={handleGoogleSignIn} 
            className="flex items-center gap-2 w-full py-6 relative overflow-hidden group"
            disabled={loading}
          >
            <div className="absolute inset-0 w-3 bg-white group-hover:w-full transition-all duration-300 ease-out opacity-10"></div>
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
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
        </div>
        
        <div className="mt-3 text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
