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
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error or no user:', authError);
        throw new Error('Authentication error');
      }

      console.log('User found:', user.id);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        // If profile doesn't exist, create an empty one
        if (profileError.message.includes('contains 0 rows')) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id })
            .select('first_name, last_name')
            .single();
            
          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw insertError;
          }
          return newProfile;
        }
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Profile data:', data);
      return data as Profile;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
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

  let displayName = 'User';
  if (isLoading) {
    displayName = '...';
  } else if (error) {
    console.error('Error loading profile:', error);
    displayName = 'User';
  } else if (profile && (profile.first_name || profile.last_name)) {
    displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  }

  return (
    <div className="border-b border-gray-100 bg-white py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Hello, {displayName}
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