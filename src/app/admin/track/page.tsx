
"use client";

import { useEffect, useState } from 'react';
import { useAuth, withAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BarChart3, Users, Search, ListVideo, Heart } from 'lucide-react';
import { getUserActivity } from '@/app/actions/user-settings';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type UserActivity = {
    totalInteractions: number;
    interactionsLast30Days: { date: string; count: number }[];
    totalUsers: number;
    totalSearches: number;
    totalPlaylists: number;
    totalLikes: number;
};

const chartConfig = {
  interactions: {
    label: "Interactions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function TrackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<UserActivity | null>(null);
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
      const { data, error } = await getUserActivity(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setActivity(data);
      }
    }
    setIsLoading(false);
  };
  
  if (authLoading || isLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Activity...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">User Activity Tracker</h1>

      {error ? (
         <Alert variant="destructive">
            <AlertTitle>Error Loading Activity</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      ) : (
        <div className="grid gap-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity?.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity?.totalSearches}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
                        <ListVideo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity?.totalPlaylists}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activity?.totalLikes}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Total Interactions Per Day (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    {isLoading ? (
                         <Skeleton className="h-[250px] w-full" />
                    ) : (
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={activity?.interactionsLast30Days} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 6)} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="var(--color-interactions)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

        </div>
      )}
    </main>
  );
}

export default withAuth(TrackPage);
