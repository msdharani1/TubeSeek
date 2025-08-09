
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { getAllUserSearches } from '@/app/actions';
import type { SearchQuery, UserInfo } from '@/types/youtube';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, History as HistoryIcon, Search } from 'lucide-react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UserSearchData = Record<string, { profile?: UserInfo; searches: SearchQuery[] }>;

function UserHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchData, setSearchData] = useState<UserSearchData>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [historySort, setHistorySort] = useState('newest');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== "msdharaniofficial@gmail.com") {
        router.replace('/search');
      } else {
        fetchData();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    if (user?.email) {
      const { data, error } = await getAllUserSearches(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setSearchData(data);
      }
    }
    setIsLoading(false);
  };
  
  const filteredUsers = useMemo(() => {
    return Object.entries(searchData).filter(([userId, userData]) => {
        const profile = userData.profile;
        const searchTerm = userSearchTerm.toLowerCase();
        const emailMatch = profile?.email?.toLowerCase().includes(searchTerm);
        const nameMatch = profile?.displayName?.toLowerCase().includes(searchTerm);
        const guestMatch = !profile && `guest ${userId.substring(0, 6)}`.includes(searchTerm);
        return emailMatch || nameMatch || guestMatch;
    });
  }, [searchData, userSearchTerm]);


  const selectedUserData = useMemo(() => {
    if (!selectedUser || !searchData[selectedUser]) return [];
    const searches = [...searchData[selectedUser].searches]; // Create a copy
    if (historySort === 'oldest') {
        return searches.reverse();
    }
    return searches;
  }, [selectedUser, searchData, historySort]);

  if (authLoading || (!user && !authLoading) || user?.email !== "msdharaniofficial@gmail.com") {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <RippleWaveLoader />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">User Search History</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RippleWaveLoader />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <Card className="md:col-span-1">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5"/>
                        Find a User
                    </CardTitle>
                    <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..." 
                            className="pl-10"
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <div className="space-y-2 pr-4">
                            {filteredUsers.length > 0 ? filteredUsers.map(([userId, userData]) => {
                                const profile = userData.profile;
                                const displayName = profile?.email || `Guest ${userId.substring(0,6)}`;
                                return (
                                <Button
                                    key={userId}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-auto py-2 px-3",
                                        selectedUser === userId && "bg-muted"
                                    )}
                                    onClick={() => setSelectedUser(userId)}
                                >
                                    <Avatar className="h-8 w-8 mr-3">
                                        <AvatarImage src={profile?.photoURL || undefined} />
                                        <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-medium text-sm truncate">{profile?.displayName || `Guest ${userId.substring(0,6)}`}</p>
                                        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                                    </div>
                                </Button>
                                )
                            }) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <p>No users found.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                        <CardTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5"/>
                            Search History
                        </CardTitle>
                        <CardDescription className="mt-1">
                             {selectedUser ? "Viewing history for selected user." : "Select a user to view their history."}
                        </CardDescription>
                        </div>
                        {selectedUser && (
                            <Select value={historySort} onValueChange={setHistorySort}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                {selectedUser ? (
                    selectedUserData.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Search Query</TableHead>
                            <TableHead className="text-right">Results</TableHead>
                            <TableHead className="text-right">Date & Time</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {selectedUserData.map((search, index) => (
                            <TableRow key={index}>
                            <TableCell className="font-medium">{search.query}</TableCell>
                            <TableCell className="text-right">{search.resultsCount}</TableCell>
                            <TableCell className="text-right">
                                {new Date(search.timestamp).toLocaleString()}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p>This user has no search history yet.</p>
                    </div>
                    )
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                    <p>Please select a user from the list to see their search history.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      )}
    </main>
  );
}

export default withAuth(UserHistoryPage);
