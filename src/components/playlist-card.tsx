
import Image from "next/image";
import type { Playlist } from "@/types/youtube";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ListVideo } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type PlaylistCardProps = {
  playlist?: Playlist;
  onClick?: (playlistId: string) => void;
};

export function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {

  if (!playlist) {
    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-2">
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-4 w-3/6" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card 
        className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group" 
        onClick={() => onClick?.(playlist.id)}
    >
      <CardHeader className="p-0 relative aspect-video bg-muted flex items-center justify-center">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt={playlist.name}
            width={400}
            height={225}
            className="w-full h-full object-cover"
            data-ai-hint="video thumbnail"
          />
        ) : (
            <ListVideo className="w-16 h-16 text-muted-foreground"/>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white font-bold text-lg">View Playlist</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-base font-bold leading-snug line-clamp-2">
          {playlist.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
            {playlist.videoCount} {playlist.videoCount === 1 ? 'video' : 'videos'}
        </p>
      </CardContent>
    </Card>
  );
}
