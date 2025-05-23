
import { useState, useRef } from "react";
import { Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface FeedPostFormProps {
  onPostCreated?: () => void;
}

export function EnhancedFeedPostForm({ onPostCreated }: FeedPostFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };

    reader.readAsDataURL(file);
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() && !image) {
      toast({
        title: "Empty post",
        description: "Please add some content or an image to your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if one is selected
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Check if posts bucket exists, create if not
        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // Create the post
      const { error } = await supabase.from("feed_posts").insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Post created",
        description: "Your post has been published",
      });

      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile?.avatar_url} />
              ) : (
                <AvatarFallback>
                  {profile?.username?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-64 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                onClick={removeImage}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Image className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </div>
            <Button type="submit" disabled={isSubmitting || (!content.trim() && !image)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
