
"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ListPlus, PlusCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { getPlaylists, createPlaylist, updateVideoInPlaylists } from "@/app/actions/playlist";
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
    const [isLoading, setIsLoading] = useState(true);
    const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open && user) {
            fetchPlaylists();
        }
    }, [open, user]);

    const fetchPlaylists = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data } = await getPlaylists(user.uid);
        
        const fetchedPlaylists = data || [];
        const hasFavorite = fetchedPlaylists.some(p => p.name === 'Favorite');
        
        if (!hasFavorite) {
            setPlaylists([defaultFavoritePlaylist, ...fetchedPlaylists]);
        } else {
            setPlaylists(fetchedPlaylists);
        }

        // This part is complex. For now, we assume we don't know which playlists
        // the video is in when the popover opens. A more robust solution would
        // check this, but it adds significant complexity.
        setSelectedPlaylists([]);
        setIsLoading(false);
    };

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
            setPlaylists(prev => {
                const newPlaylists = [data, ...prev.filter(p => p.id !== 'favorite-default')];
                return newPlaylists;
            });
            setSelectedPlaylists(prev => [...prev, data.id]); // Auto-select new playlist
            setNewPlaylistName("");
            setShowNewPlaylistInput(false);
        }
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        // This is a placeholder for checking what playlists the video is *currently* in.
        // A more robust solution would fetch this state. For now, we pass an empty array.
        const videoIsCurrentlyIn: string[] = []; 
        const { error } = await updateVideoInPlaylists(user.uid, video, selectedPlaylists, videoIsCurrentlyIn);
        
        if (error) {
             toast({ variant: "destructive", title: "Failed to save", description: error });
        } else {
             toast({ title: "Playlists updated!" });
             setOpen(false);
        }
        setIsSaving(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">
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
                            {playlists.map(playlist => (
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
