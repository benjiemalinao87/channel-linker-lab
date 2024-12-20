import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const MediaUploadForm = () => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    file: null as File | null,
    thumbnail: null as File | null,
    url: "", // New field for link type
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [type]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.type !== 'link' && (!formData.file || !formData.thumbnail)) {
      toast({
        title: "Error",
        description: "Please select both a file and thumbnail",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'link' && !formData.url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);
    try {
      let fileUrl = formData.url;
      let thumbnailUrl = '';

      if (formData.type !== 'link') {
        // Upload main file
        const fileExt = formData.file!.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: fileError } = await supabase.storage
          .from('media')
          .upload(filePath, formData.file!);

        if (fileError) throw fileError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
      }

      // Upload thumbnail (required for all types)
      const thumbExt = formData.thumbnail!.name.split('.').pop();
      const thumbPath = `thumbnails/${crypto.randomUUID()}.${thumbExt}`;
      const { error: thumbError } = await supabase.storage
        .from('media')
        .upload(thumbPath, formData.thumbnail!);

      if (thumbError) throw thumbError;

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(thumbPath);
      
      thumbnailUrl = thumbUrl;

      // Save to database
      const { error: dbError } = await supabase
        .from('media_items')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          content_url: fileUrl,
          thumbnail_url: thumbnailUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media item added successfully",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "video",
        file: null,
        thumbnail: null,
        url: "",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload media item",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Type</label>
        <select
          className="w-full border rounded-md p-2"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="link">Link</option>
        </select>
      </div>

      {formData.type === 'link' ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium">URL</label>
          <Input
            type="url"
            required
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm font-medium">File</label>
          <Input
            type="file"
            onChange={(e) => handleFileChange(e, 'file')}
            accept={formData.type === 'video' ? 'video/*' : formData.type === 'audio' ? 'audio/*' : '*/*'}
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Thumbnail</label>
        <Input
          type="file"
          onChange={(e) => handleFileChange(e, 'thumbnail')}
          accept="image/*"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={uploadLoading}
      >
        {uploadLoading ? 'Uploading...' : 'Add Media Item'}
      </Button>
    </form>
  );
};