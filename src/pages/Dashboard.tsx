import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AuthGuard } from "@/components/dashboard/AuthGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MediaGrid } from "@/components/dashboard/MediaGrid";
import { MediaDialog } from "@/components/dashboard/MediaDialog";

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
  
  const { data: mediaItems = [], isLoading: isMediaLoading, refetch } = useQuery({
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F1F0FB]">
        <DashboardHeader />
        
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
          
          <MediaGrid
            mediaItems={filteredContent}
            isLoading={isMediaLoading}
            onMediaClick={setSelectedMedia}
            onUpdate={refetch}
          />

          <MediaDialog
            selectedMedia={selectedMedia}
            onOpenChange={(open) => !open && setSelectedMedia(null)}
          />
        </div>
      </div>
    </AuthGuard>
  );
}