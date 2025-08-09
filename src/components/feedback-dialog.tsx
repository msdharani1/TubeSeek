
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Trash2, Send, Star, Image as ImageIcon, Video } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;
const MAX_FILE_SIZE_MB = 10;

function StarRating({ rating, setRating, disabled }: { rating: number, setRating: (r: number) => void, disabled: boolean }) {
    return (
        <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-8 w-8 cursor-pointer transition-colors",
                        star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30',
                        !disabled && "hover:text-yellow-300"
                    )}
                    onClick={() => !disabled && setRating(star)}
                />
            ))}
        </div>
    )
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [user, open]);
  
  useEffect(() => {
      if (!open) {
          setMessage('');
          setFiles([]);
          setActiveTab('feedback');
          setRating(0);
      }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    let newFiles = [...files];
    let imageCount = files.filter(f => f.type.startsWith('image/')).length;
    let videoCount = files.filter(f => f.type.startsWith('video/')).length;
    
    for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'File too large', description: `${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.` });
            continue;
        }

        if (file.type.startsWith('image/')) {
            if (imageCount >= MAX_IMAGES) {
                toast({ variant: 'destructive', title: 'Image limit reached', description: `You can only upload up to ${MAX_IMAGES} images.`});
                continue;
            }
            imageCount++;
        } else if (file.type.startsWith('video/')) {
            if (videoCount >= MAX_VIDEOS) {
                toast({ variant: 'destructive', title: 'Video limit reached', description: `You can only upload up to ${MAX_VIDEOS} videos.`});
                continue;
            }
            videoCount++;
        } else {
             toast({ variant: 'destructive', title: 'Unsupported file type', description: `${file.name} is not a supported file type.` });
             continue;
        }
        newFiles.push(file);
    }
    setFiles(newFiles);
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  const uploadFiles = async (): Promise<string[] | null> => {
    if (files.length === 0) return null;
    
    setIsUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        toast({ variant: 'destructive', title: 'Upload Error', description: 'Cloudinary environment variables are not set.'});
        setIsUploading(false);
        return null;
    }

    const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: formData,
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `Failed to upload ${file.name}.`);
            }
            return response.json();
        });
    });

    try {
      const results = await Promise.all(uploadPromises);
      setIsUploading(false);
      return results.map(result => result.secure_url);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during upload.';
      toast({ variant: 'destructive', title: 'Upload Failed', description: errorMessage });
      setIsUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploading) return;
    if (activeTab === 'feedback' && rating === 0) {
        toast({ variant: 'destructive', title: 'Rating required', description: 'Please select a rating before submitting.' });
        return;
    }
    if (!message.trim()) {
        toast({ variant: 'destructive', title: 'Message required', description: 'Please enter a message.' });
        return;
    }

    setIsSubmitting(true);
    let attachmentUrls = null;

    if (activeTab === 'bug' && files.length > 0) {
      attachmentUrls = await uploadFiles();
      if (!attachmentUrls) {
        setIsSubmitting(false);
        return; // Upload failed, stop submission
      }
    }
    
    const feedbackData = {
      type: activeTab as 'feedback' | 'bug',
      rating: activeTab === 'feedback' ? rating : undefined,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      attachmentUrls,
      userId: user?.uid,
      userAgent: navigator.userAgent,
    };
    
    const { success, error } = await submitFeedback(feedbackData);

    if (success) {
      toast({ title: 'Submission received', description: "Thanks for helping us improve!" });
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error });
    }
    
    setIsSubmitting(false);
  };
  
  const isLoading = isUploading || isSubmitting;
  const isSubmitDisabled = isLoading || (activeTab === 'feedback' ? rating === 0 && !message.trim() : !message.trim());


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Have a question, a bug to report, or some feedback? Let us know.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feedback" disabled={isLoading}>Feedback</TabsTrigger>
                <TabsTrigger value="bug" disabled={isLoading}>Bug Report</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="mt-4">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                 <div className="space-y-2">
                    <Label htmlFor="rating" className="text-center block">How would you rate your experience?</Label>
                    <StarRating rating={rating} setRating={setRating} disabled={isLoading} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name-feedback">Name</Label>
                        <Input id="name-feedback" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required disabled={!!user?.displayName || isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-feedback">Email</Label>
                        <Input id="email-feedback" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required disabled={!!user?.email || isLoading} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="message-feedback">Tell us what you think</Label>
                    <Textarea id="message-feedback" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`What went well? What could be improved?`} minLength={10} disabled={isLoading}/>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bug" className="mt-4">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name-bug">Name</Label>
                        <Input id="name-bug" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required disabled={!!user?.displayName || isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-bug">Email</Label>
                        <Input id="email-bug" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required disabled={!!user?.email || isLoading} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="message-bug">Describe the bug</Label>
                    <Textarea id="message-bug" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Please be as detailed as possible...`} required minLength={10} disabled={isLoading}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Attach Files (Optional)</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {files.map((file, index) => (
                           <div key={index} className="relative group aspect-square border rounded-md overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <Image src={URL.createObjectURL(file)} alt={`preview ${index}`} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-2">
                                        <Video className="w-6 h-6 text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground text-center line-clamp-2 mt-1">{file.name}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeFile(index)} disabled={isLoading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <label htmlFor="file-upload" className={cn("relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg mt-2", isLoading ? "cursor-not-allowed bg-muted/50" : "cursor-pointer hover:bg-muted/50")}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                            <p className="text-xs text-muted-foreground">Up to 5 images & 5 videos</p>
                        </div>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" multiple disabled={isLoading}/>
                    </label>
                </div>
              </div>
            </TabsContent>

             <DialogFooter className="mt-6">
                <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Send Message'}
                </Button>
            </DialogFooter>
            </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
