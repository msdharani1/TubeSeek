
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type VideoPlayerProps = {
  videoId: string | null;
  onClose: () => void;
};

export function VideoPlayer({ videoId, onClose }: VideoPlayerProps) {
  const isOpen = videoId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
        <DialogTitle className="sr-only">Playing Video</DialogTitle>
        <div className="aspect-video">
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
