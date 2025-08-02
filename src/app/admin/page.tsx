
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { getAllUserSearches } from '@/app/actions';
import type { SearchQuery } from '@/types/youtube';

import { Header } from '@/components/header';
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
import { Loader2 } from 'lucide-react';

type UserSearchData = Record<string, SearchQuery[]>;

function AdminPage() {
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
  const selectedUserData = selectedUser ? searchData[selectedUser] : [];

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
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>

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
              <CardTitle>User Search History</CardTitle>
              <div className="mt-4">
                <Select onValueChange={setSelectedUser} disabled={userIds.length === 0}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a user to view their history" />
                  </SelectTrigger>
                  <SelectContent>
                    {userIds.map(userId => (
                      <SelectItem key={userId} value={userId}>
                        {userId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
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

export default withAuth(AdminPage);
