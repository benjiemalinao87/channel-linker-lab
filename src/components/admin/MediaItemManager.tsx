import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content_url: string;
  thumbnail_url: string;
}

interface MediaItemManagerProps {
  item: MediaItem;
  onUpdate: () => void;
}

export const MediaItemManager = ({ item, onUpdate }: MediaItemManagerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description || "",
  });
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('media_items')
        .update({
          title: formData.title,
          description: formData.description,
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media item updated successfully",
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update media item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media item deleted successfully",
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete media item",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Title"
        />
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
        />
        <div className="flex gap-2">
          <Button onClick={handleUpdate}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </div>
  );
};