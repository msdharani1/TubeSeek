
"use client";

import { useEffect, useState } from 'react';
import { useAuth, withAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MousePointerClick, BarChart3, FileJson, Link as LinkIcon } from 'lucide-react';
import { getClickAnalytics } from '@/app/actions/clicks';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type ClickAnalytics = {
    totalClicks: number;
    clicksLast30Days: { date: string; count: number }[];
    clicksByPage: { page: string; count: number }[];
};

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function ClicksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<ClickAnalytics | null>(null);
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
      const { data, error } = await getClickAnalytics(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setAnalytics(data);
      }
    }
    setIsLoading(false);
  };
  
  if (authLoading || isLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Analytics...</p>
        </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Click Analytics</h1>

      {error ? (
         <Alert variant="destructive">
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      ) : (
        <div className="grid gap-8">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Site Clicks</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.totalClicks.toLocaleString()}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pages Tracked</CardTitle>
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.clicksByPage.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/>Clicks Per Day (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    {isLoading ? (
                         <Skeleton className="h-[250px] w-full" />
                    ) : (
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={analytics?.clicksLast30Days} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 6)} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" fill="var(--color-clicks)" radius={4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5"/>Clicks by Page</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Page Path</TableHead>
                                <TableHead className="text-right">Total Clicks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics?.clicksByPage.map(page => (
                                <TableRow key={page.page}>
                                    <TableCell className="font-medium">{page.page}</TableCell>
                                    <TableCell className="text-right">{page.count.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
      )}
    </main>
  );
}

export default withAuth(ClicksPage);
