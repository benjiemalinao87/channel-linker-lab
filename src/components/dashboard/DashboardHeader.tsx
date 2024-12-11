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

      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.log('Profile fetch error:', error);
        return null;
      }

      console.log('Profile data:', data);
      return data as Profile;
    }
  });

  // Check if user is admin
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
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Media Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {displayName}!
        </p>
      </div>
      <div className="flex gap-4 items-center">
        {!isAdmin && (
          <Button variant="outline" onClick={() => setShowAdminInput(!showAdminInput)}>
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
            />
            <Button onClick={handleAdminLogin}>Login</Button>
          </div>
        )}
        {isAdmin && (
          <Button onClick={() => navigate('/admin')}>
            Admin Panel
          </Button>
        )}
      </div>
    </div>
  );
};