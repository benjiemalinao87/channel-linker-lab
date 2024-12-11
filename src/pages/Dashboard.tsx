import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MediaCard } from "@/components/MediaCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MediaItem {
  id: string;
  type: "video" | "audio" | "link";
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
}

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const navigate = useNavigate();
  
  const { data: mediaItems = [], isLoading } = useQuery({
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Media Dashboard</h1>
          <Button onClick={() => navigate('/admin')}>
            Admin Panel
          </Button>
        </div>
        
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <MediaCard
                key={item.id}
                type={item.type}
                title={item.title}
                description={item.description}
                thumbnail={item.thumbnail_url}
                onClick={() => handleMediaClick(item)}
              />
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