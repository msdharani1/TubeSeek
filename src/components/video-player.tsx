
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { ThumbsUp, Eye, X, Share2, History, ListVideo, Bell, BellRing, Heart, LogIn, Copy, Check, Facebook } from "lucide-react";
import type { SearchResult, WatchedVideo, PlaylistItem } from "@/types/youtube";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatDistanceToNowStrict } from 'date-fns';
import { cn, formatCount, formatDuration } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { saveVideoToHistory, updateVideoProgress } from "@/app/actions";
import { getInteractionStatus, toggleLikeVideo, toggleSubscription } from "@/app/actions/video-interactions";
import { AddToPlaylist } from "./add-to-playlist";
import { Badge } from "./ui/badge";
import { useSidebar } from "./ui/sidebar";
import { LoginPromptDialog } from "./login-prompt-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Twitter } from "lucide-react";

// Helper to parse and style the description
const formatDescription = (text: string, seekTo: (seconds: number) => void) => {
    if (!text) return "No description available.";
    
    const timestampRegex = /(\d{1,2}:\d{2}(?::\d{2})?)/g; // Matches MM:SS and HH:MM:SS
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /(#\w+)/g;

    const timeToSeconds = (time: string) => {
        const parts = time.split(':').map(Number);
        if (parts.length === 3) { // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        if (parts.length === 2) { // MM:SS
            return parts[0] * 60 + parts[1];
        }
        return 0;
    };

    return text.split('\n').map((line, i) => (
        <p key={i}>
            {line.split(linkRegex).map((part, j) => {
                if (part.match(linkRegex)) {
                    return <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{part}</a>;
                }
                return part.split(hashtagRegex).map((hashPart, k) => {
                    if (hashPart.match(hashtagRegex)) {
                        return <span key={`${j}-${k}`} className="text-accent">{hashPart}</span>;
                    }
                     return hashPart.split(timestampRegex).map((timePart, l) => {
                        if (timePart.match(timestampRegex)) {
                            const seconds = timeToSeconds(timePart);
                            return <a key={`${j}-${k}-${l}`} onClick={() => seekTo(seconds)} className="text-accent hover:underline cursor-pointer">{timePart}</a>;
                        }
                        return timePart;
                    });
                });
            })}
        </p>
    ));
};

function ShareDialog({ video }: { video: SearchResult }) {
    const { toast } = useToast();
    const videoUrl = `${window.location.origin}/search?q=${encodeURIComponent(new URLSearchParams(window.location.search).get('q') || '')}&v=${video.videoId}`;
    const [isCopied, setIsCopied] = useState(false);
    
    const onCopy = () => {
        navigator.clipboard.writeText(videoUrl).then(() => {
            toast({ title: 'Link Copied!', description: 'The video link has been copied to your clipboard.' });
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy the link.' });
        });
    };

    const socialShares = [
        {
            name: "WhatsApp",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.803 6.166l-1.225 4.485 4.574-1.194z" /></svg>,
            url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this video: ${video.title}\n${videoUrl}`)}`,
        },
        {
            name: "X (Twitter)",
            icon: <Twitter />,
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(`Watch "${video.title}"`)}&via=msdharani007`,
        },
        {
            name: "Facebook",
            icon: <Facebook />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
        },
        {
            name: "Gmail",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.5v15c0 .825-.675 1.5-1.5 1.5H1.5C.675 21 0 20.325 0 19.5v-15c0-.428.173-.834.46-1.125.285-.292.684-.46 1.09-.46h21c.825 0 1.5.675 1.5 1.5zm-3 1.5-7.5 6-7.5-6h15zm-15 12h15c.276 0 .5-.224.5-.5V8l-7.5 6-7.5-6v10c0 .276.224.5.5.5z"/></svg>,
            url: `mailto:?subject=${encodeURIComponent(`Check out this video: ${video.title}`)}&body=${encodeURIComponent(`I thought you might like this video:\n${video.title}\n\n${videoUrl}`)}`,
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button variant="outline" className={cn("hover:bg-muted/50 transition-all flex-shrink-0")}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Video</DialogTitle>
                    <DialogDescription>Share this video with your friends!</DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Input value={videoUrl} readOnly />
                    <Button onClick={onCopy} size="icon" className="shrink-0">
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <div className="grid grid-cols-4 gap-4 pt-4">
                    {socialShares.map(social => (
                        <a 
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted">
                                {social.icon}
                            </div>
                            <span className="text-xs">{social.name}</span>
                        </a>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function SuggestionCard({ video, onPlay }: { video: SearchResult | WatchedVideo | PlaylistItem, onPlay: (video: SearchResult) => void }) {
    const isWatchedVideo = 'watchedAt' in video && video.watchedAt;
    const isPlaylistItem = 'addedAt' in video && video.addedAt;
    
    let timeAgo: string | null = null;
    if (isWatchedVideo) {
        timeAgo = formatDistanceToNowStrict(new Date(video.watchedAt), { addSuffix: true });
    } else if (isPlaylistItem) {
        timeAgo = formatDistanceToNowStrict(new Date(video.addedAt), { addSuffix: true });
    } else {
        timeAgo = formatDistanceToNowStrict(new Date(video.publishedAt), { addSuffix: true });
    }
    
    return (
        <button onClick={() => onPlay(video)} className="flex gap-4 w-full text-left hover:bg-muted/50 rounded-lg p-2 transition-colors">
            <div className="relative shrink-0">
                <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={160}
                    height={90}
                    className="w-40 h-auto aspect-video rounded-md object-cover"
                    data-ai-hint="video thumbnail"
                />
                 <Badge
                    variant="secondary"
                    className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5"
                >
                    {formatDuration(video.duration)}
                </Badge>
            </div>
            <div className="flex flex-col text-sm">
                <h4 className="font-semibold line-clamp-2 leading-snug">{video.title}</h4>
                <div className="text-muted-foreground mt-1 text-xs">
                    <p className="line-clamp-1">{video.channelTitle}</p>
                    <p>{formatCount(video.viewCount)} views &bull; {timeAgo}</p>
                </div>
            </div>
        </button>
    )
}

const VideoDetails = ({ 
    video,
    showAddToPlaylistButton, 
    seekTo,
    isLiked,
    isSubscribed,
    onLike,
    onSubscribe,
    likeCount,
    isGuest
}: { 
    video: SearchResult, 
    showAddToPlaylistButton: boolean, 
    seekTo: (seconds: number) => void,
    isLiked: boolean,
    isSubscribed: boolean,
    onLike: () => void,
    onSubscribe: () => void,
    likeCount: number,
    isGuest: boolean,
}) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [promptOpen, setPromptOpen] = useState(false);

    const publishedDate = formatDistanceToNowStrict(new Date(video.publishedAt), { addSuffix: true });

    const handleGuestAction = (e: React.MouseEvent) => {
        e.preventDefault();
        setPromptOpen(true);
    }

    return (
        <div className="p-6">
            <LoginPromptDialog 
                open={promptOpen}
                onOpenChange={setPromptOpen}
                title="Login to unlock this feature"
                description="Liking videos, subscribing to channels, and creating playlists are available only to logged-in users. Please sign in to continue."
            />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {video.title}
            </h1>
            <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4"/>
                        {formatCount(video.viewCount)} views
                    </span>
                     <span>&bull;</span>
                    <span>{publishedDate}</span>
                </div>
                <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2">
                        <Button variant={isLiked ? 'secondary' : 'outline'} onClick={isGuest ? handleGuestAction : onLike} className="hover:bg-muted/50 flex-shrink-0">
                            <ThumbsUp className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
                            {formatCount(likeCount)}
                        </Button>
                        <ShareDialog video={video} />
                        {showAddToPlaylistButton && <div className="flex-shrink-0"><AddToPlaylist video={video} /></div>}
                    </div>
                </div>
            </div>
            <div className="border-y py-4 my-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">{video.channelTitle}</h3>
                <Button variant={isSubscribed ? 'default' : 'outline'} onClick={isGuest ? handleGuestAction : onSubscribe} className="hover:bg-muted/50">
                    {isSubscribed ? <BellRing className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground">Description</h3>
                <div className={cn(
                    "whitespace-pre-wrap break-words",
                    !isDescriptionExpanded && "line-clamp-3"
                )}>
                     {formatDescription(video.description, seekTo)}
                </div>
                {(video.description?.split('\n').length > 3 || video.description?.length > 200) && (
                     <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="p-0 h-auto text-primary">
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                    </Button>
                )}
            </div>
        </div>
    );
};

type VideoPlayerProps = {
  video: SearchResult | null;
  suggestions: (SearchResult | WatchedVideo | PlaylistItem)[];
  onPlaySuggestion: (video: SearchResult) => void;
  onClose: () => void;
  source: 'search' | 'history' | 'playlist' | 'liked';
  playlistName?: string;
};

export function VideoPlayer({ video, suggestions, onPlaySuggestion, onClose, source, playlistName }: VideoPlayerProps) {
  const { user } = useAuth();
  const { isMobile, state: sidebarState } = useSidebar();
  const playerRef = useRef<any>(null); // To hold the YouTube player instance
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const isGuest = !user;

  const onPlayerReady = useCallback((event: any) => {
    if (!video) return;
    const startSeconds = 'progressSeconds' in video ? video.progressSeconds : 0;
    if (startSeconds) {
        event.target.seekTo(startSeconds, true);
    }
    event.target.playVideo();
  }, [video]);
  
  const onPlayerStateChange = useCallback((event: any) => {
    if (isGuest) return;

    if (event.data === YT.PlayerState.PLAYING) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
            const currentTime = event.target.getCurrentTime();
            if (user && video) {
                updateVideoProgress(user.uid, video.videoId, currentTime);
            }
        }, 5000); // Save progress every 5 seconds
    } else {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }
  }, [user, video, isGuest]);


  const loadYouTubePlayer = useCallback(() => {
    if (!video) return;

    const createPlayer = () => {
        if (playerRef.current) {
            playerRef.current.destroy();
        }
        playerRef.current = new YT.Player('youtube-player', {
            videoId: video.videoId,
            playerVars: {
                autoplay: 1,
                rel: 0,
                start: 'progressSeconds' in video && video.progressSeconds ? Math.floor(video.progressSeconds) : 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    if (window.YT && window.YT.Player) {
        createPlayer();
    } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        (window as any).onYouTubeIframeAPIReady = createPlayer;
    }
  }, [video, onPlayerReady, onPlayerStateChange]);


  const fetchStatus = useCallback(async () => {
    if (!user || !video) return;
    const { data, error } = await getInteractionStatus(user.uid, video.videoId, video.channelId);
    if (error) {
        console.error("Failed to get interaction status", error);
    } else if (data) {
        setIsLiked(data.isLiked);
        setIsSubscribed(data.isSubscribed);
    }
  }, [user, video]);
  
  useEffect(() => {
    if (video) {
        setLikeCount(Number(video.likeCount) || 0);
        loadYouTubePlayer();
        if (user) {
            fetchStatus();
            saveVideoToHistory(user.uid, video)
                .then(result => {
                    if(result.error) {
                        console.warn("Could not save to history:", result.error)
                    } else {
                        localStorage.removeItem(`history_cache_${user.uid}`);
                    }
                })
        }
    }
    
    // Cleanup on component unmount
    return () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
        }
    }
  }, [video, user, fetchStatus, loadYouTubePlayer]);

  const seekTo = (seconds: number) => {
    if (playerRef.current) {
        playerRef.current.seekTo(seconds, true);
    }
  };

  const handleLike = async () => {
      if (!user || !video) return;
      
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
      
      const { error } = await toggleLikeVideo(user.uid, video);
      if (error) {
          setIsLiked(wasLiked);
          setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
          toast({ variant: "destructive", title: "Failed to like video", description: error });
      } else {
          localStorage.removeItem(`liked_videos_cache_${user.uid}`);
      }
  }

  const handleSubscribe = async () => {
      if (!user || !video) return;
      setIsSubscribed(!isSubscribed);
      const { error } = await toggleSubscription(user.uid, video.channelId, video.channelTitle);
      if (error) {
          setIsSubscribed(!isSubscribed);
          toast({ variant: "destructive", title: "Failed to subscribe", description: error });
      } else {
          localStorage.removeItem(`subscriptions_cache_${user.uid}`);
      }
  }

  if (!video) {
    return null;
  }

  const showAddToPlaylistButton = source !== 'playlist';

  const getUpNextTitle = () => {
    switch(source) {
        case 'history':
            return 'Recent History';
        case 'liked':
            return 'Recent Likes';
        case 'playlist':
            return `From: ${playlistName || 'Playlist'}`;
        case 'search':
        default:
            return 'Up next';
    }
  }

  const getUpNextIcon = () => {
      switch(source) {
        case 'history':
            return <History className="w-5 h-5"/>;
        case 'liked':
            return <Heart className="w-5 h-5"/>;
        case 'playlist':
            return <ListVideo className="w-5 h-5"/>;
        case 'search':
        default:
            return null;
    }
  }

  return (
    <div className={cn(
        "fixed bottom-0 top-16 right-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in-0 transition-all duration-200",
        "left-0 lg:left-[var(--sidebar-width-icon)]",
        !isMobile && sidebarState === 'expanded' && "!left-[var(--sidebar-width)]"
        )}>
        <div className="bg-card shadow-xl w-full h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden no-scrollbar border-t">
            
            <div className="lg:w-[70%] lg:flex-shrink-0 lg:overflow-y-scroll no-scrollbar">
                <div className="w-full aspect-video shrink-0 bg-black lg:relative sticky top-0 z-10">
                    <div id="youtube-player" className="w-full h-full"></div>
                </div>
                 <VideoDetails 
                    video={video} 
                    showAddToPlaylistButton={showAddToPlaylistButton} 
                    seekTo={seekTo}
                    isLiked={isLiked}
                    isSubscribed={isSubscribed}
                    onLike={handleLike}
                    onSubscribe={handleSubscribe}
                    likeCount={likeCount}
                    isGuest={isGuest}
                 />
            </div>

            <div className="flex-1 lg:w-[30%] lg:border-l flex flex-col min-h-0 lg:overflow-y-auto no-scrollbar border-t lg:border-t-0">
                <div className="p-4">
                    <h3 className="text-lg font-bold mb-4 px-2 flex items-center gap-2 sticky top-0 bg-card/80 backdrop-blur-sm py-2 z-10">
                       {getUpNextIcon()}
                       {getUpNextTitle()}
                    </h3>
                    <div className="flex flex-col gap-2">
                        {suggestions.map(suggestion => {
                            const key = 'id' in suggestion && suggestion.id ? suggestion.id : suggestion.videoId;
                            return <SuggestionCard key={key} video={suggestion} onPlay={onPlaySuggestion} />
                        })}
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 bg-background/50 hover:bg-background/80 transition-colors z-20 hidden sm:block"
                aria-label="Close video player"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    </div>
  );
}
