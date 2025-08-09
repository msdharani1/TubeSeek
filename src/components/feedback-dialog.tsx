
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
import { Loader2, UploadCloud, File, Trash2, Send } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('feedback');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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
  }, [user]);
  
  useEffect(() => {
      if (!open) {
          // Reset form on close
          setMessage('');
          setFile(null);
          setFilePreview(null);
          setActiveTab('feedback');
      }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: 'File too large', description: 'Please upload a file smaller than 5MB.' });
            return;
        }
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        toast({ variant: 'destructive', title: 'Upload Error', description: 'Cloudinary environment variables are not set.'});
        setIsUploading(false);
        return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to upload file.');
      }
      
      const data = await response.json();
      setIsUploading(false);
      return data.secure_url;
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
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    let attachmentUrl = null;

    if (activeTab === 'bug' && file) {
      attachmentUrl = await uploadFile();
      if (!attachmentUrl) {
        setIsSubmitting(false);
        return; // Upload failed, stop submission
      }
    }
    
    const feedbackData = {
      type: activeTab as 'feedback' | 'bug',
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      attachmentUrl,
      userId: user?.uid,
      userAgent: navigator.userAgent,
    };
    
    const { success, error } = await submitFeedback(feedbackData);

    if (success) {
      toast({ title: 'Feedback submitted', description: "Thanks for helping us improve!" });
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error });
    }
    
    setIsSubmitting(false);
  };
  
  const isLoading = isUploading || isSubmitting;

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
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="bug">Bug Report</TabsTrigger>
            </TabsList>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required disabled={!!user?.displayName} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required disabled={!!user?.email} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Tell us what you think...`} required minLength={10} />
                </div>
                <TabsContent value="bug" className="m-0 p-0">
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Attach Screenshot/Video (Optional)</Label>
                        {filePreview ? (
                            <div className="relative w-full aspect-video border rounded-md overflow-hidden">
                                {file?.type.startsWith('image/') ? (
                                    <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <video src={filePreview} className="w-full h-full object-contain" controls />
                                )}
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => { setFile(null); setFilePreview(null); }}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                             <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                    <p className="text-xs text-muted-foreground">Image or Video (MAX. 5MB)</p>
                                </div>
                                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" disabled={isLoading}/>
                            </label>
                        )}
                    </div>
                </TabsContent>
            </div>
             <DialogFooter>
                <Button type="submit" className="w-full" disabled={isLoading || !message.trim()}>
                    {(isUploading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Send Message'}
                </Button>
            </DialogFooter>
            </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
