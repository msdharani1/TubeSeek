"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { getAllUserSearches } from '@/app/actions';
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
import { Loader2, User, History as HistoryIcon } from 'lucide-react';

type UserSearchData = Record<string, { profile: UserInfo; searches: SearchQuery[] }>;

function UserHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchData, setSearchData] = useState<UserSearchData>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const userIds = Object.keys(searchData);
  const selectedUserData = selectedUser ? searchData[selectedUser].searches : [];

  if (authLoading || (!user && !authLoading) || user?.email !== "msdharaniofficial@gmail.com") {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">User Search History</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5"/>
                Select a User
              </CardTitle>
              <div className="mt-4">
                <Select onValueChange={setSelectedUser} disabled={userIds.length === 0}>
                  <SelectTrigger className="w-full md:w-[380px]">
                    <SelectValue placeholder="Select a user to view their history" />
                  </SelectTrigger>
                  <SelectContent>
                    {userIds.map(userId => (
                      <SelectItem key={userId} value={userId}>
                        <div className="flex items-center gap-3">
                           <Avatar className="h-6 w-6">
                              <AvatarImage src={searchData[userId].profile.photoURL || undefined} />
                              <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                           </Avatar>
                           <span>{searchData[userId].profile.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <p>Please select a user to see their search history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

export default withAuth(UserHistoryPage);
