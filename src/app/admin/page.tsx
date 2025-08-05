"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Users, Search, ListVideo, Heart, LineChart } from 'lucide-react';
import { getDashboardStats } from '@/app/actions/admin';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardStats = {
    totalUsers: number;
    totalSearches: number;
    totalPlaylists: number;
    totalLikes: number;
    newUsersLast30Days: { date: string; count: number }[];
};

const chartConfig = {
  users: {
    label: "New Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
      const { data, error } = await getDashboardStats(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setStats(data);
      }
    }
    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
        </div>
    );
  }

  if (error) {
     return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </main>
     )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSearches}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
                <ListVideo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPlaylists}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLikes}</div>
            </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5"/>New Users (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
            ) : (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <RechartsLineChart data={stats?.newUsersLast30Days} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 6)} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line dataKey="count" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={false} />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
          </CardContent>
      </Card>
    </main>
  );
}

export default withAuth(AdminDashboardPage);
