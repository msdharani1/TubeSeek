
"use client";

import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Trash2, ShieldAlert, Settings as SettingsIcon, Users, Check, Ban, ChevronLeft } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import packageJson from '../../../package.json';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { clearWatchHistory, deleteAllPlaylists, clearLikedVideos, clearSubscriptions } from '@/app/actions/user-data';
import { SettingsCard, SettingsItem, SettingsLinkItem } from '@/components/settings-card';
import { getAllUsersWithSettings, toggleUserSuggestion, toggleAllUserSuggestions } from '@/app/actions/user-settings';
import type { UserInfo } from '@/types/youtube';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

type UserWithSettings = UserInfo & { id: string, suggestionsEnabled: boolean };

function UserManagementCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<UserWithSettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.email === 'msdharaniofficial@gmail.com') {
            fetchUsers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchUsers = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        const { data, error } = await getAllUsersWithSettings(user.email);
        if (error) {
            toast({ variant: 'destructive', title: 'Failed to load users', description: error });
            setUsers([]);
        } else {
            setUsers(data || []);
        }
        setIsLoading(false);
    }

    const handleToggle = async (userId: string, isEnabled: boolean) => {
        if (!user?.email) return;
        
        // Optimistic UI update
        setUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, suggestionsEnabled: isEnabled} : u));

        const { success, error } = await toggleUserSuggestion(user.email, userId, isEnabled);
        if (!success) {
            // Revert on failure
             setUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, suggestionsEnabled: !isEnabled} : u));
            toast({ variant: 'destructive', title: 'Update failed', description: error });
        }
    }

    const handleToggleAll = async (isEnabled: boolean) => {
        if (!user?.email) return;

        const originalUsers = [...users];
        setUsers(currentUsers => currentUsers.map(u => ({...u, suggestionsEnabled: isEnabled})));

        const { success, error } = await toggleAllUserSuggestions(user.email, isEnabled);
        if (success) {
            toast({ title: `All users have been ${isEnabled ? 'enabled' : 'disabled'}.` });
        } else {
            setUsers(originalUsers);
            toast({ variant: 'destructive', title: 'Update failed', description: error });
        }
    }

    if (user?.email !== 'msdharaniofficial@gmail.com') {
        return null;
    }

    return (
        <SettingsCard 
            title="User Management"
            description="Enable or disable video suggestions for users."
            icon={<Users />}
        >
            <div className="flex items-center justify-end gap-2 mb-4">
                <Button size="sm" onClick={() => handleToggleAll(true)}>
                    <Check className="mr-2 h-4 w-4" />
                    Enable All
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleToggleAll(false)}>
                    <Ban className="mr-2 h-4 w-4" />
                    Disable All
                </Button>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto no-scrollbar">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-11 rounded-full" />
                        </div>
                    ))
                ) : (
                    users.map(u => (
                         <SettingsItem key={u.id}>
                            <div className="flex items-center gap-4 overflow-hidden">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={u.photoURL || undefined} alt={u.displayName || 'User'} />
                                    <AvatarFallback><User/></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{u.displayName}</p>
                                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                                </div>
                            </div>
                            <Switch
                                checked={u.suggestionsEnabled}
                                onCheckedChange={(checked) => handleToggle(u.id, checked)}
                                aria-label={`Toggle suggestions for ${u.displayName}`}
                            />
                        </SettingsItem>
                    ))
                )}
            </div>
        </SettingsCard>
    )
}


function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeletingHistory, setIsDeletingHistory] = useState(false);
    const [isDeletingPlaylists, setIsDeletingPlaylists] = useState(false);
    const [isDeletingLikes, setIsDeletingLikes] = useState(false);
    const [isDeletingSubs, setIsDeletingSubs] = useState(false);

    if (!user) return null;

    const appVersion = packageJson.version;
    const creationDate = user.metadata.creationTime 
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const handleSignOut = async () => {
        try {
          await signOut(auth);
          router.push('/login');
        } catch (error) {
          console.error("Error signing out: ", error);
           toast({
            variant: "destructive",
            title: "Logout Failed",
            description: "An error occurred while signing out. Please try again.",
          });
        }
    };

    const handleDeleteHistory = async () => {
        if (!user) return;
        setIsDeletingHistory(true);
        const { success, error } = await clearWatchHistory(user.uid);
        if (success) {
            toast({ title: "Watch history cleared successfully!" });
        } else {
            toast({ variant: "destructive", title: "Failed to clear history", description: error });
        }
        setIsDeletingHistory(false);
    }
    
    const handleDeletePlaylists = async () => {
        if (!user) return;
        setIsDeletingPlaylists(true);
        const { success, error } = await deleteAllPlaylists(user.uid);
        if (success) {
            toast({ title: "All playlists deleted successfully!" });
        } else {
            toast({ variant: "destructive", title: "Failed to delete playlists", description: error });
        }
        setIsDeletingPlaylists(false);
    }

    const handleDeleteLikes = async () => {
        if (!user) return;
        setIsDeletingLikes(true);
        const { success, error } = await clearLikedVideos(user.uid);
        if (success) {
            toast({ title: "Liked videos cleared successfully!" });
        } else {
            toast({ variant: "destructive", title: "Failed to clear likes", description: error });
        }
        setIsDeletingLikes(false);
    }

    const handleDeleteSubs = async () => {
        if (!user) return;
        setIsDeletingSubs(true);
        const { success, error } = await clearSubscriptions(user.uid);
        if (success) {
            toast({ title: "All subscriptions cleared successfully!" });
        } else {
            toast({ variant: "destructive", title: "Failed to clear subscriptions", description: error });
        }
        setIsDeletingSubs(false);
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center mb-8">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>

            <div className="space-y-8">
                {/* User Profile Section */}
                <SettingsCard title="Profile" description="This is your account information." icon={<User />}>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>
                                <User className="h-8 w-8" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-lg font-semibold">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Membership since: {creationDate}</p>
                        </div>
                    </div>
                </SettingsCard>

                {/* Appearance Section */}
                <SettingsCard title="Appearance" description="Customize the look and feel of the app." icon={<SettingsIcon/>}>
                    <SettingsItem>
                        <p className="font-medium">Theme</p>
                        <ThemeSwitcher />
                    </SettingsItem>
                </SettingsCard>

                <UserManagementCard />

                {/* About Section */}
                <SettingsCard title="About" description="Information about the application.">
                    <div className="divide-y">
                        <SettingsItem>
                            <p className="font-medium">App Version</p>
                            <p className="text-muted-foreground">{appVersion}</p>
                        </SettingsItem>
                        <SettingsLinkItem href="/privacy-policy">
                            Privacy Policy
                        </SettingsLinkItem>
                    </div>
                </SettingsCard>

                {/* Danger Zone */}
                <SettingsCard 
                    title="Danger Zone"
                    description="These actions are irreversible and any data deleted cannot be recovered. Please proceed with caution."
                    className="border-destructive/50"
                    icon={<ShieldAlert/>}
                >
                      <div className="space-y-4">
                        <SettingsItem>
                            <div>
                                <p className="font-medium">Clear Watch History</p>
                                <p className="text-sm text-muted-foreground">Delete all of your watched videos.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" outline>
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your entire watch history.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteHistory} disabled={isDeletingHistory}>
                                        {isDeletingHistory ? "Clearing..." : "Yes, clear history"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SettingsItem>
                          <SettingsItem>
                            <div>
                                <p className="font-medium">Delete All Playlists</p>
                                <p className="text-sm text-muted-foreground">Permanently delete all of your playlists.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" outline>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all of your playlists and their content.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeletePlaylists} disabled={isDeletingPlaylists}>
                                          {isDeletingPlaylists ? "Deleting..." : "Yes, delete playlists"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SettingsItem>
                        <SettingsItem>
                            <div>
                                <p className="font-medium">Clear Liked Videos</p>
                                <p className="text-sm text-muted-foreground">Delete all of your liked videos.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" outline>
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all your liked videos.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteLikes} disabled={isDeletingLikes}>
                                        {isDeletingLikes ? "Clearing..." : "Yes, clear likes"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SettingsItem>
                          <SettingsItem>
                            <div>
                                <p className="font-medium">Clear All Subscriptions</p>
                                <p className="text-sm text-muted-foreground">Permanently remove all your channel subscriptions.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" outline>
                                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently remove all of your channel subscriptions.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSubs} disabled={isDeletingSubs}>
                                          {isDeletingSubs ? "Clearing..." : "Yes, clear subscriptions"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SettingsItem>
                          <SettingsItem>
                            <div>
                                <p className="font-medium">Log Out</p>
                                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                            </div>
                            <Button variant="destructive" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" /> Log Out
                            </Button>
                        </SettingsItem>
                    </div>
                </SettingsCard>
            </div>
        </main>
    );
}

export default withAuth(SettingsPage);
