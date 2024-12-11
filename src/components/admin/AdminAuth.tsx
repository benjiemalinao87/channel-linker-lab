import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PASSWORD } from "@/config/admin";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = () => {
    setLoading(true);
    if (password === ADMIN_PASSWORD) {
      onAuthenticated();
      toast({
        title: "Success",
        description: "Admin access granted",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Admin Access</h1>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button 
          className="w-full" 
          onClick={handleAuth}
          disabled={loading}
        >
          Access Admin Panel
        </Button>
      </div>
    </div>
  );
};