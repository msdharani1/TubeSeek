
"use client";

import { useState } from 'react';
import { withAuth, useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, ChevronRight, LogOut, Trash2, ShieldAlert } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
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
import { clearWatchHistory, deleteAllPlaylists } from '@/app/actions/user-data';


function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeletingHistory, setIsDeletingHistory] = useState(false);
    const [isDeletingPlaylists, setIsDeletingPlaylists] = useState(false);
    
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

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

                <div className="space-y-8">
                    {/* User Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>This is your account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
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
                        </CardContent>
                    </Card>

                    {/* Appearance Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-3">
                             <p className="font-medium">Theme</p>
                             <ThemeSwitcher />
                           </div>
                        </CardContent>
                    </Card>

                    {/* About Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                            <CardDescription>Information about the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y">
                           <div className="flex items-center justify-between py-3">
                                <p className="font-medium">App Version</p>
                                <p className="text-muted-foreground">{appVersion}</p>
                            </div>
                            <Link href="/privacy-policy" className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-6 px-6 cursor-pointer">
                                <span className="font-medium">Privacy Policy</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                           <div className="flex items-center gap-3">
                             <ShieldAlert className="w-6 h-6 text-destructive" />
                             <CardTitle className="text-destructive">Danger Zone</CardTitle>
                           </div>
                            <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
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
                            </div>
                             <div className="flex items-center justify-between">
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
                            </div>
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Log Out</p>
                                    <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                                </div>
                                <Button variant="destructive" onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

export default withAuth(SettingsPage);
