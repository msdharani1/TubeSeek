
"use client";

import { useState, useEffect, useMemo } from 'react';
import { withAuth, useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users, Check, Ban, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SettingsCard, SettingsItem } from '@/components/settings-card';
import { getAllUsersWithSettings, toggleUserSuggestion, toggleAllUserSuggestions } from '@/app/actions/user-settings';
import type { UserInfo } from '@/types/youtube';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserWithSettings = UserInfo & { id: string, suggestionsEnabled: boolean, joinDate: string };

function SuggestionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<UserWithSettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('name_asc');

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
            setAllUsers([]);
        } else {
            setAllUsers(data || []);
        }
        setIsLoading(false);
    }
    
    const filteredAndSortedUsers = useMemo(() => {
        let users = [...allUsers];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            users = users.filter(u => 
                u.displayName?.toLowerCase().includes(lowercasedFilter) ||
                u.email?.toLowerCase().includes(lowercasedFilter)
            );
        }

        switch (sortOrder) {
            case 'name_asc':
                users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
                break;
            case 'name_desc':
                users.sort((a, b) => (b.displayName || '').localeCompare(a.displayName || ''));
                break;
            case 'enabled_first':
                users.sort((a, b) => (b.suggestionsEnabled ? 1 : 0) - (a.suggestionsEnabled ? 1 : 0));
                break;
            case 'disabled_first':
                 users.sort((a, b) => (a.suggestionsEnabled ? 1 : 0) - (b.suggestionsEnabled ? 1 : 0));
                break;
        }

        return users;
    }, [allUsers, searchTerm, sortOrder]);


    const handleToggle = async (userId: string, isEnabled: boolean) => {
        if (!user?.email) return;
        
        setAllUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, suggestionsEnabled: isEnabled} : u));

        const { success, error } = await toggleUserSuggestion(user.email, userId, isEnabled);
        if (!success) {
             setAllUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, suggestionsEnabled: !isEnabled} : u));
            toast({ variant: 'destructive', title: 'Update failed', description: error });
        }
    }

    const handleToggleAll = async (isEnabled: boolean) => {
        if (!user?.email) return;

        const originalUsers = [...allUsers];
        setAllUsers(currentUsers => currentUsers.map(u => ({...u, suggestionsEnabled: isEnabled})));

        const { success, error } = await toggleAllUserSuggestions(user.email, isEnabled);
        if (success) {
            toast({ title: `All users have been ${isEnabled ? 'enabled' : 'disabled'}.` });
        } else {
            setAllUsers(originalUsers);
            toast({ variant: 'destructive', title: 'Update failed', description: error });
        }
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">User Suggestions Management</h1>
        <SettingsCard 
            title="User Suggestions"
            description="Enable or disable video suggestions for all users."
            icon={<Lightbulb />}
        >
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                            <SelectItem value="enabled_first">Enabled First</SelectItem>
                            <SelectItem value="disabled_first">Disabled First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center justify-end gap-2">
                    <Button size="sm" onClick={() => handleToggleAll(true)}>
                        <Check className="mr-2 h-4 w-4" />
                        Enable All
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleToggleAll(false)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Disable All
                    </Button>
                </div>
            </div>
            <div className="divide-y mt-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                {isLoading ? (
                    Array.from({length: 5}).map((_, i) => (
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
                ) : filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map(u => (
                         <SettingsItem key={u.id}>
                            <div className="flex items-center gap-4 overflow-hidden">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={u.photoURL || undefined} alt={u.displayName || 'User'} />
                                    <AvatarFallback><User/></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{u.displayName || `Guest ${u.id.substring(0,6)}`}</p>
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
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No users found matching your criteria.
                    </div>
                )}
            </div>
        </SettingsCard>
       </main>
    )
}


export default withAuth(SuggestionsPage);
