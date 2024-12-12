import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaItem {
  id: string;
  type: "video" | "audio" | "link";
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
}

interface MediaDialogProps {
  selectedMedia: MediaItem | null;
  onOpenChange: (open: boolean) => void;
}

export const MediaDialog = ({ selectedMedia, onOpenChange }: MediaDialogProps) => {
  if (!selectedMedia) return null;

  return (
    <Dialog open={!!selectedMedia} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{selectedMedia.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {selectedMedia.type === 'video' && (
            <video 
              controls 
              className="w-full rounded-lg"
              src={selectedMedia.content_url}
            />
          )}
          {selectedMedia.type === 'audio' && (
            <audio 
              controls 
              className="w-full"
              src={selectedMedia.content_url}
            />
          )}
          {selectedMedia.type === 'link' && (
            <a 
              href={selectedMedia.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Open Link
            </a>
          )}
          <p className="mt-4 text-gray-600">{selectedMedia.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};