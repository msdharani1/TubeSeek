
"use client";

import { Button } from "./ui/button";
import { ThumbsUp, Eye, Copy, X } from "lucide-react";
import { Separator } from "./ui/separator";
import type { SearchResult } from "@/types/youtube";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type VideoPlayerProps = {
  video: SearchResult | null;
  onClose: () => void;
};

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied!",
        description: "The video page link has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the link to your clipboard.",
      });
    });
  };

  if (!video) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in-0">
        <div className="bg-card rounded-lg shadow-xl w-full h-full flex flex-col overflow-hidden">
            <div className="flex-grow flex flex-col lg:flex-row lg:overflow-hidden">
                {/* Left Column: Video Player and main info */}
                <div className="lg:w-[70%] lg:h-full flex flex-col lg:overflow-y-auto">
                    <div className="aspect-video shrink-0 bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-foreground">
                            {video.title}
                        </h1>
                        <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4"/>
                                    {Number(video.viewCount).toLocaleString()} views
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <ThumbsUp className="w-4 h-4"/>
                                    {Number(video.likeCount).toLocaleString()} likes
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handleCopyLink}>
                                    <Copy className="mr-2 h-4 w-4"/>
                                    Copy link
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right Column: Description */}
                <div className="lg:w-[30%] lg:h-full lg:overflow-y-auto border-t lg:border-t-0 lg:border-l">
                    <div className="p-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                            <h3 className="font-semibold text-foreground">Description</h3>
                            <p>{video.description || "No description available."}</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 bg-background/50 hover:bg-background/80 transition-colors z-10"
                aria-label="Close video player"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    </div>
  );
}
