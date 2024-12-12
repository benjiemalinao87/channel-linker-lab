import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT' || !session) {
        console.log('No session found, redirecting to login');
        toast.error("Please login to access the dashboard");
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth status:', error);
        throw error;
      }

      if (!session) {
        console.log('No active session found, redirecting to login');
        throw new Error('No active session');
      }

      console.log('User is authenticated:', session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error("Please login to access the dashboard");
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};