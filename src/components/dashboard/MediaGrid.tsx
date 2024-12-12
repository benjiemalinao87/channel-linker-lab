import { MediaCard } from "@/components/MediaCard";
import { MediaItemManager } from "@/components/admin/MediaItemManager";
import { ADMIN_PASSWORD } from "@/config/admin";

interface MediaItem {
  id: string;
  type: "video" | "audio" | "link";
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
}

interface MediaGridProps {
  mediaItems: MediaItem[];
  isLoading: boolean;
  onMediaClick: (item: MediaItem) => void;
  onUpdate: () => void;
}

export const MediaGrid = ({ mediaItems, isLoading, onMediaClick, onUpdate }: MediaGridProps) => {
  const isAdmin = localStorage.getItem('isAdmin') === ADMIN_PASSWORD;

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mediaItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
          <MediaCard
            type={item.type}
            title={item.title}
            description={item.description}
            thumbnail={item.thumbnail_url}
            onClick={() => onMediaClick(item)}
          />
          {isAdmin && (
            <div className="mt-3">
              <MediaItemManager item={item} onUpdate={onUpdate} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};