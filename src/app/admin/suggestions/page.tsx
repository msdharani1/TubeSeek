
"use client";

import { useState, useEffect } from 'react';
import { withAuth, useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SettingsCard, SettingsItem } from '@/components/settings-card';
import { getAllUsersWithSettings, toggleUserSuggestion, toggleAllUserSuggestions } from '@/app/actions/user-settings';
import type { UserInfo } from '@/types/youtube';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

type UserWithSettings = UserInfo & { id: string, suggestionsEnabled: boolean };

function SuggestionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [users, setUsers] = useState<UserWithSettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.email !== 'msdharaniofficial@gmail.com') {
             router.replace('/search');
        } else {
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

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">User Suggestions Management</h1>
        <SettingsCard 
            title="User Suggestions"
            description="Enable or disable video suggestions for all users."
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
       </main>
    )
}


export default withAuth(SuggestionsPage);
