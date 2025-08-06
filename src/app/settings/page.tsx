
"use client";

import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Trash2, ShieldAlert, Settings as SettingsIcon, ChevronLeft, Download, LogIn } from 'lucide-react';
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

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeletingHistory, setIsDeletingHistory] = useState(false);
    const [isDeletingPlaylists, setIsDeletingPlaylists] = useState(false);
    const [isDeletingLikes, setIsDeletingLikes] = useState(false);
    const [isDeletingSubs, setIsDeletingSubs] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const appVersion = packageJson.version;

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

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                toast({ title: 'App installed successfully!' });
            }
            setInstallPrompt(null);
        });
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
    
    const creationDate = user?.metadata.creationTime 
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center mb-8">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>

            <div className="space-y-8">
                {user ? (
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
                ) : (
                    <SettingsCard title="Account" description="Sign in to unlock all features." icon={<User />}>
                        <Button className="w-full" onClick={() => router.push('/login')}>
                            <LogIn className="mr-2 h-4 w-4"/>
                            Sign In / Create Account
                        </Button>
                    </SettingsCard>
                )}


                {/* Appearance Section */}
                <SettingsCard title="Appearance" description="Customize the look and feel of the app." icon={<SettingsIcon/>}>
                    <SettingsItem className="flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <p className="font-medium">Theme</p>
                        <ThemeSwitcher />
                    </SettingsItem>
                </SettingsCard>

                 {/* Application Section */}
                {installPrompt && (
                  <SettingsCard title="Application" description="Install TubeSeek on your device for a native app experience.">
                      <SettingsItem>
                          <div>
                              <p className="font-medium">Install App</p>
                              <p className="text-sm text-muted-foreground">Get a better experience by installing the app.</p>
                          </div>
                          <Button onClick={handleInstallClick}>
                              <Download className="mr-2 h-4 w-4" /> Install
                          </Button>
                      </SettingsItem>
                  </SettingsCard>
                )}


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

                {/* Data & Account Actions for logged-in users */}
                {user && (
                    <SettingsCard 
                        title="Data & Account Actions"
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
                )}
            </div>
        </main>
    );
}

export default withAuth(SettingsPage);
