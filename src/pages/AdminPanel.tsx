import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PASSWORD } from "@/config/admin";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    file: null as File | null,
    thumbnail: null as File | null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
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
  };

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
    if (!formData.file || !formData.thumbnail) {
      toast({
        title: "Error",
        description: "Please select both a file and thumbnail",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);
    try {
      // Upload main file
      const fileExt = formData.file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: fileError } = await supabase.storage
        .from('media')
        .upload(filePath, formData.file);

      if (fileError) throw fileError;

      // Upload thumbnail
      const thumbExt = formData.thumbnail.name.split('.').pop();
      const thumbPath = `thumbnails/${crypto.randomUUID()}.${thumbExt}`;
      const { error: thumbError } = await supabase.storage
        .from('media')
        .upload(thumbPath, formData.thumbnail);

      if (thumbError) throw thumbError;

      // Get public URLs
      const { data: { publicUrl: fileUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(thumbPath);

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

  if (!isAuthenticated) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

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

          <div className="space-y-2">
            <label className="block text-sm font-medium">File</label>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, 'file')}
              accept={formData.type === 'video' ? 'video/*' : formData.type === 'audio' ? 'audio/*' : '*/*'}
            />
          </div>

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
      </div>
    </div>
  );
}