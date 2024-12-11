import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PASSWORD } from "@/config/admin";

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('Auth error or no user:', authError);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.log('Profile fetch error:', error);
        return null;
      }

      return data as Profile;
    }
  });

  const isAdmin = localStorage.getItem('isAdmin') === ADMIN_PASSWORD;

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', ADMIN_PASSWORD);
      toast.success("Admin access granted");
      setShowAdminInput(false);
      setAdminPassword("");
      window.location.reload();
    } else {
      toast.error("Invalid admin password");
    }
  };

  const displayName = profile ? 
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
    'User';

  return (
    <div className="border-b border-gray-100 bg-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello {displayName},
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          {!isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => setShowAdminInput(!showAdminInput)}
              className="text-sm"
            >
              Admin Login
            </Button>
          )}
          {showAdminInput && (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="h-9"
              />
              <Button 
                onClick={handleAdminLogin}
                className="h-9"
              >
                Login
              </Button>
            </div>
          )}
          {isAdmin && (
            <Button 
              onClick={() => navigate('/admin')}
              className="h-9"
            >
              Admin Panel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};