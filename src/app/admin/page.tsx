
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { getUsersForAdmin, getUserSearchHistoryForAdmin } from '@/app/actions';
import type { SearchQuery, UserInfo } from '@/types/youtube';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, User } from 'lucide-react';

type UserProfile = UserInfo & { id: string };

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([]);

  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userNextCursor, setUserNextCursor] = useState<string | null>(null);
  const [historyNextCursor, setHistoryNextCursor] = useState<number | null>(null);

  const userObserver = useRef<IntersectionObserver>();
  const historyObserver = useRef<IntersectionObserver>();

  const fetchUsers = useCallback(async (cursor?: string | null) => {
    if (!user?.email) return;
    setIsUsersLoading(true);
    setError(null);
    const { data, error } = await getUsersForAdmin(user.email, cursor);
    if (error) {
        setError(error);
    } else if (data) {
        setUsers(prev => cursor ? [...prev, ...data.users] : data.users);
        setUserNextCursor(data.nextCursor);
    }
    setIsUsersLoading(false);
  }, [user?.email]);

  const fetchHistory = useCallback(async (userId: string, cursor?: number | null) => {
    if (!user?.email) return;
    setIsHistoryLoading(true);
    const { data, error } = await getUserSearchHistoryForAdmin(user.email, userId, cursor);
    if (error) {
        setError(error);
    } else if (data) {
        setSearchHistory(prev => cursor ? [...prev, ...data.searches] : data.searches);
        setHistoryNextCursor(data.nextCursor);
    }
    setIsHistoryLoading(false);
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== "msdharaniofficial@gmail.com") {
        router.replace('/search');
      } else {
        fetchUsers();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedUser) {
        setSearchHistory([]);
        setHistoryNextCursor(null);
        fetchHistory(selectedUser);
    } else {
        setSearchHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);


  const lastUserElementRef = useCallback(node => {
      if (isUsersLoading) return;
      if (userObserver.current) userObserver.current.disconnect();
      userObserver.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && userNextCursor) {
              fetchUsers(userNextCursor);
          }
      });
      if (node) userObserver.current.observe(node);
  }, [isUsersLoading, userNextCursor, fetchUsers]);

  const lastHistoryElementRef = useCallback(node => {
    if (isHistoryLoading) return;
    if (historyObserver.current) historyObserver.current.disconnect();
    historyObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && historyNextCursor && selectedUser) {
        fetchHistory(selectedUser, historyNextCursor);
      }
    });
    if (node) historyObserver.current.observe(node);
  }, [isHistoryLoading, historyNextCursor, selectedUser, fetchHistory]);


  if (authLoading || (!user && !authLoading) || user?.email !== "msdharaniofficial@gmail.com") {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
      {error ? (
          <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User Search History</CardTitle>
            <div className="mt-4">
              <Select onValueChange={setSelectedUser} disabled={users.length === 0 && isUsersLoading}>
                <SelectTrigger className="w-full md:w-[380px]">
                  <SelectValue placeholder="Select a user to view their history" />
                </SelectTrigger>
                <SelectContent>
                    {users.map((u, index) => {
                        const isLastElement = users.length === index + 1;
                        return (
                          <SelectItem ref={isLastElement ? lastUserElementRef : null} key={u.id} value={u.id}>
                              <div className="flex items-center gap-3">
                              <Avatar className="h-6 w-6">
                                  <AvatarImage src={u.photoURL || undefined} />
                                  <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                              </Avatar>
                              <span>{u.email}</span>
                              </div>
                          </SelectItem>
                        );
                    })}
                    {isUsersLoading && (
                        <div className="flex justify-center items-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        </div>
                    )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
                <>
                  {searchHistory.length > 0 ? (
                  <Table>
                      <TableHeader>
                      <TableRow>
                          <TableHead>Search Query</TableHead>
                          <TableHead className="text-right">Results</TableHead>
                          <TableHead className="text-right">Date & Time</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {searchHistory.map((search, index) => {
                          const isLastElement = searchHistory.length === index + 1;
                          return (
                              <TableRow ref={isLastElement ? lastHistoryElementRef : null} key={search.id || index}>
                                  <TableCell className="font-medium">{search.query}</TableCell>
                                  <TableCell className="text-right">{search.resultsCount}</TableCell>
                                  <TableCell className="text-right">
                                      {new Date(search.timestamp).toLocaleString()}
                                  </TableCell>
                              </TableRow>
                          );
                        })}
                      </TableBody>
                  </Table>
                  ) : !isHistoryLoading ? (
                      <div className="text-center text-muted-foreground py-12">
                          <p>This user has no search history yet.</p>
                      </div>
                  ) : null}

                  {isHistoryLoading && (
                      <div className="flex justify-center items-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                  )}

                  {historyNextCursor === null && searchHistory.length > 0 && !isHistoryLoading && (
                        <div className="text-center text-muted-foreground py-6">
                          <p>End of history.</p>
                      </div>
                  )}
                </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                  {isUsersLoading ? (
                      <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin"/>
                          <span>Loading users...</span>
                      </div>
                  ) : users.length > 0 ? (
                      <p>Please select a user to see their search history.</p>
                  ) : (
                      <p>No user search data found.</p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}

export default withAuth(AdminPage);
