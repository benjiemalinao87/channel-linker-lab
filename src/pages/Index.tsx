import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F1F0FB]">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/8ef77a4c-fff9-4c82-8782-5a38587a124b.png" 
              alt="Channel Automation Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              Channel Automation - Demo Library
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Welcome to Channel Automation</h2>
          <p className="text-xl text-gray-600 mb-8">Access your media library and start managing your content.</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="px-8"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;