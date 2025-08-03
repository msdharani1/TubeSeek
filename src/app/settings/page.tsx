
"use client";

import { withAuth, useAuth } from '@/context/auth-context';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, ChevronRight } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import packageJson from '../../../package.json';

function SettingsPage() {
    const { user } = useAuth();
    
    if (!user) return null;

    const appVersion = packageJson.version;

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
                            <div className="flex items-center justify-between">
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
                </div>
            </main>
        </>
    );
}

export default withAuth(SettingsPage);
