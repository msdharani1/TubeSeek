
import type { SearchResult } from "@/types/youtube";
import { VideoCard } from "./video-card";

type VideoGridProps = {
  videos: SearchResult[];
  onPlayVideo: (videoId: string) => void;
};

export function VideoGrid({ videos, onPlayVideo }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} onPlay={onPlayVideo} />
      ))}
    </div>
  );
}
