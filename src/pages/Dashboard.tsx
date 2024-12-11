import { useState, useEffect } from "react";
import { MediaCard } from "@/components/MediaCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaItemManager } from "@/components/admin/MediaItemManager";
import { ADMIN_PASSWORD } from "@/config/admin";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  type: "video" | "audio" | "link";
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth status:', error);
        toast.error("Authentication error");
        navigate('/login');
        return;
      }

      if (!session) {
        console.log('No active session found, redirecting to login');
        toast.error("Please login to access the dashboard");
        navigate('/login');
        return;
      }

      console.log('User is authenticated:', session.user.id);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const { data: mediaItems = [], isLoading, refetch } = useQuery({
    queryKey: ['media-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MediaItem[];
    }
  });

  const filteredContent = mediaItems.filter(
    (item) => activeCategory === "all" || item.type === activeCategory
  );

  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const isAdmin = localStorage.getItem('isAdmin') === ADMIN_PASSWORD;

  return (
    <div className="min-h-screen bg-[#F1F0FB]">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                <MediaCard
                  type={item.type}
                  title={item.title}
                  description={item.description}
                  thumbnail={item.thumbnail_url}
                  onClick={() => handleMediaClick(item)}
                />
                {isAdmin && (
                  <div className="mt-3">
                    <MediaItemManager item={item} onUpdate={refetch} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedMedia?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {selectedMedia?.type === 'video' && (
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={selectedMedia.content_url}
                />
              )}
              {selectedMedia?.type === 'audio' && (
                <audio 
                  controls 
                  className="w-full"
                  src={selectedMedia.content_url}
                />
              )}
              {selectedMedia?.type === 'link' && (
                <a 
                  href={selectedMedia.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open Link
                </a>
              )}
              <p className="mt-4 text-gray-600">{selectedMedia?.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}