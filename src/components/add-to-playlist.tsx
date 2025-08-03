
"use client";

import { useState, useEffect, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ListPlus, PlusCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { getPlaylists, createPlaylist, updateVideoInPlaylists, getPlaylistsForVideo } from "@/app/actions/playlist";
import type { Playlist, SearchResult } from "@/types/youtube";
import { useToast } from "@/hooks/use-toast";

const defaultFavoritePlaylist: Playlist = {
    id: 'favorite-default',
    name: 'Favorite',
    videoCount: 0,
    createdAt: Date.now(),
};

export function AddToPlaylist({ video }: { video: SearchResult }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
    const [initialSelectedPlaylists, setInitialSelectedPlaylists] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const [playlistsRes, videoPlaylistsRes] = await Promise.all([
            getPlaylists(user.uid),
            getPlaylistsForVideo(user.uid, video.videoId)
        ]);

        // Process playlists
        const fetchedPlaylists = playlistsRes.data || [];
        const dbHasFavorite = fetchedPlaylists.some(p => p.name === 'Favorite');
        if (!dbHasFavorite) {
            setPlaylists([defaultFavoritePlaylist, ...fetchedPlaylists]);
        } else {
            setPlaylists(fetchedPlaylists);
        }

        // Process which playlists the video is in
        if (videoPlaylistsRes.data) {
            const videoIsIn = videoPlaylistsRes.data;
            const favoritePlaylist = fetchedPlaylists.find(p => p.name === 'Favorite');
            
            // Map the placeholder 'favorite-default' if needed
            const finalSelection = videoIsIn.map(id => {
                 return id;
            });

            // Special handling if the real "Favorite" exists and video is in it
            if (favoritePlaylist && videoIsIn.includes(favoritePlaylist.id)) {
                 if (!finalSelection.includes('favorite-default')) {
                    finalSelection.push('favorite-default');
                 }
            }
            
            setSelectedPlaylists(finalSelection);
            setInitialSelectedPlaylists(finalSelection);
        } else {
            setSelectedPlaylists([]);
            setInitialSelectedPlaylists([]);
        }

        setIsLoading(false);
    }, [user, video.videoId]);


    useEffect(() => {
        if (open) {
            fetchAllData();
        }
    }, [open, fetchAllData]);

    const handleCheckedChange = (playlistId: string) => {
        setSelectedPlaylists(prev => 
            prev.includes(playlistId) 
                ? prev.filter(id => id !== playlistId) 
                : [...prev, playlistId]
        );
    };
    
    const handleCreatePlaylist = async () => {
        if (!user || !newPlaylistName.trim()) return;
        setIsCreating(true);
        const { data, error } = await createPlaylist(user.uid, newPlaylistName);
        if (error) {
            toast({ variant: "destructive", title: "Failed to create playlist", description: error });
        } else if (data) {
             const allPlaylists = await getPlaylists(user.uid);
             if (allPlaylists.data) {
                const dbHasFavorite = allPlaylists.data.some(p => p.name === 'Favorite');
                 if (!dbHasFavorite) {
                    setPlaylists([defaultFavoritePlaylist, ...allPlaylists.data]);
                } else {
                    setPlaylists(allPlaylists.data);
                }
             }
            setSelectedPlaylists(prev => [...prev, data.id]); // Auto-select new playlist
            setNewPlaylistName("");
            setShowNewPlaylistInput(false);
        }
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        
        const { error } = await updateVideoInPlaylists(user.uid, video, selectedPlaylists, initialSelectedPlaylists);
        
        if (error) {
             toast({ variant: "destructive", title: "Failed to save", description: error });
        } else {
             toast({ title: "Playlists updated!" });
             setOpen(false);
        }
        setIsSaving(false);
    }

    // Determine the actual DB IDs for saving
    const finalSelectedIds = selectedPlaylists.filter(id => id !== 'favorite-default');
    const favoritePlaylistInDb = playlists.find(p => p.name === 'Favorite' && p.id !== 'favorite-default');
    if (selectedPlaylists.includes('favorite-default') && favoritePlaylistInDb) {
        if (!finalSelectedIds.includes(favoritePlaylistInDb.id)) {
            finalSelectedIds.push(favoritePlaylistInDb.id);
        }
    }


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="hover:bg-muted/50">
                    <ListPlus className="mr-2 h-4 w-4"/>
                    Add to Playlist
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Add to...</h4>
                        <p className="text-sm text-muted-foreground">Select playlists to add this video to.</p>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                             {playlists.sort((a,b) => {
                                if (a.name === 'Favorite') return -1;
                                if (b.name === 'Favorite') return 1;
                                return 0;
                            }).map(playlist => (
                                <div key={playlist.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={playlist.id} 
                                        checked={selectedPlaylists.includes(playlist.id)}
                                        onCheckedChange={() => handleCheckedChange(playlist.id)}
                                    />
                                    <Label htmlFor={playlist.id} className="font-normal flex-1 cursor-pointer">{playlist.name}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                    <Separator />

                    {showNewPlaylistInput ? (
                        <div className="space-y-2">
                            <Input 
                                placeholder="Enter playlist name..." 
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                disabled={isCreating}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowNewPlaylistInput(false)} disabled={isCreating}>Cancel</Button>
                                <Button size="sm" onClick={handleCreatePlaylist} disabled={isCreating || !newPlaylistName.trim()}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create
                                </Button>
                            </div>
                        </div>
                    ) : (
                         <Button variant="ghost" onClick={() => setShowNewPlaylistInput(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create new playlist
                        </Button>
                    )}
                    
                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
