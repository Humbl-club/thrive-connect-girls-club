
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Image, Loader2, X, Type } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface FeedPostFormProps {
  onPostCreated: () => void;
}

export function FeedPostForm({ onPostCreated }: FeedPostFormProps) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [textPostContent, setTextPostContent] = useState('');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  // Remove selected image
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Handle post submission
  const handlePostSubmit = async (content: string, isTextPost = false) => {
    if (!content.trim() && !selectedImage) {
      toast({
        title: 'Empty post',
        description: 'Please add some text or an image to your post',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a post',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      
      // If there's an image, upload it first
      if (selectedImage && !isTextPost) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${user.id}/${uuidv4()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('feed_images')
          .upload(filePath, selectedImage);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('feed_images')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Create the post in the database
      const { error: postError } = await supabase
        .from('feed_posts')
        .insert({
          user_id: user.id,
          content: content.trim() || null,
          image_url: imageUrl,
        });
      
      if (postError) throw postError;
      
      // Reset form
      setPostContent('');
      setTextPostContent('');
      removeImage();
      if (isTextPost) {
        setShowTextDialog(false);
      }
      onPostCreated();
      
      toast({
        title: 'Post created',
        description: 'Your post was successfully created',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleQuickPost = (e: React.FormEvent) => {
    e.preventDefault();
    handlePostSubmit(postContent);
  };

  const handleTextPost = (e: React.FormEvent) => {
    e.preventDefault();
    handlePostSubmit(textPostContent, true);
  };
  
  // Get display name for avatar
  const displayName = profile?.username || profile?.full_name || user?.email || 'User';
  const initials = displayName ? displayName[0].toUpperCase() : 'U';
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 animate-enter">
      <div className="flex gap-3 mb-4">
        <Avatar className="h-10 w-10">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={displayName} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <form onSubmit={handleQuickPost}>
            <div className="mb-2">
              <Input
                placeholder="Share something with the club..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                disabled={isSubmitting}
                className="border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-transparent"
              />
            </div>
            
            {imagePreview && (
              <div className="relative mb-3">
                <img 
                  src={imagePreview} 
                  alt="Selected preview" 
                  className="w-full rounded-lg max-h-60 object-contain bg-gray-50"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100">
                      <Type className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>Create Text Post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTextPost} className="space-y-4">
                      <Textarea
                        placeholder="What's on your mind?"
                        value={textPostContent}
                        onChange={(e) => setTextPostContent(e.target.value)}
                        disabled={isSubmitting}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowTextDialog(false)}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !textPostContent.trim()}
                          className="flex-1"
                        >
                          {isSubmitting ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                </label>
                <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              
              <Button 
                type="submit" 
                size="sm"
                disabled={isSubmitting || (!postContent.trim() && !selectedImage)} 
                className="rounded-full flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
