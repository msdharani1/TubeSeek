
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth, withAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Users, User as UserIcon, Search } from 'lucide-react';
import { getAllUsers, type UserWithJoinDate } from '@/app/actions/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<UserWithJoinDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

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
      const { data, error } = await getAllUsers(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setAllUsers(data);
      }
    }
    setIsLoading(false);
  };
  
  const filteredAndSortedUsers = useMemo(() => {
    let users = [...allUsers];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        users = users.filter(u => 
            u.displayName?.toLowerCase().includes(lowercasedFilter) ||
            u.email?.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    users.sort((a, b) => {
        const dateA = new Date(a.joinDate === 'N/A' ? 0 : a.joinDate).getTime();
        const dateB = new Date(b.joinDate === 'N/A' ? 0 : b.joinDate).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return users;
  }, [allUsers, searchTerm, sortOrder]);


  if (authLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">All Users</h1>

      {error ? (
         <Alert variant="destructive">
            <AlertTitle>Error Loading Users</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      ) : (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Registered Users ({filteredAndSortedUsers.length})
                        </CardTitle>
                        <CardDescription className="mt-1">
                            A list of all registered users in the application.
                        </CardDescription>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name or email..." 
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
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Joined Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAndSortedUsers.length > 0 ? (
                            filteredAndSortedUsers.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={u.photoURL || undefined} alt={u.displayName || 'User'}/>
                                                <AvatarFallback><UserIcon /></AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{u.displayName || `Guest ${u.id.substring(0,6)}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell className="text-right">{u.joinDate}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No users found matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </main>
  );
}

export default withAuth(UsersPage);
