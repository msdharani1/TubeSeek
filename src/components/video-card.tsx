
import Image from "next/image";
import type { WatchedVideo, SearchResult } from "@/types/youtube";
import { formatDuration, formatCount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, ThumbsUp, Eye, Clock } from "lucide-react";
import { formatDistanceToNowStrict } from 'date-fns';

type VideoCardProps = {
  video: SearchResult | WatchedVideo;
  onPlay: (video: SearchResult) => void;
};

export function VideoCard({ video, onPlay }: VideoCardProps) {
    const isWatchedVideo = 'watchedAt' in video && video.watchedAt;
    let timeAgo: string | null = null;

    if (isWatchedVideo) {
        timeAgo = formatDistanceToNowStrict(new Date(video.watchedAt), { addSuffix: true });
    }

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={400}
          height={225}
          className="w-full object-cover"
          data-ai-hint="video thumbnail"
        />
        <Badge
          variant="secondary"
          className="absolute bottom-2 right-2 bg-black/75 text-white"
        >
          {formatDuration(video.duration)}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-base font-bold leading-snug line-clamp-2">
          {video.title}
        </CardTitle>
        <CardDescription className="mt-2 text-sm line-clamp-3">
          {video.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {isWatchedVideo && timeAgo ? (
                 <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4"/>
                    Watched {timeAgo}
                </span>
            ) : (
                <>
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4"/>
                        {formatCount(video.viewCount)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4"/>
                        {formatCount(video.likeCount)}
                    </span>
                </>
            )}
        </div>
        <Button onClick={() => onPlay(video)} size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
          <PlayCircle className="mr-2 h-5 w-5" />
          Play
        </Button>
      </CardFooter>
    </Card>
  );
}
