"use client";

import { useEffect, useState } from 'react';
import { useAuth, withAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { checkApiKeysStatus } from '@/app/actions/api-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type ApiKeyStatus = {
    name: string;
    status: 'Active' | 'Quota Reached' | 'Error';
    error?: string;
};

function ApiStatusCard({ name, status, error }: ApiKeyStatus) {
    const getStatusInfo = () => {
        switch (status) {
            case 'Active':
                return {
                    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
                    badgeVariant: "default" as const,
                    badgeClass: "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30",
                    description: "This API key is operational."
                };
            case 'Quota Reached':
                return {
                    icon: <XCircle className="h-6 w-6 text-red-500" />,
                    badgeVariant: "destructive" as const,
                     badgeClass: "bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30",
                    description: "The daily quota for this key has been exceeded."
                };
            case 'Error':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
                    badgeVariant: "secondary" as const,
                    badgeClass: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30",
                    description: error || "An unexpected error occurred."
                };
        }
    }
    const info = getStatusInfo();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-muted-foreground"/>
                    {name}
                </CardTitle>
                {info.icon}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Badge className={cn("text-sm", info.badgeClass)} variant={info.badgeVariant}>
                        {status}
                    </Badge>
                     {error && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{error}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ApiLimitPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [statuses, setStatuses] = useState<ApiKeyStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    if (user?.email) {
      const { data, error } = await checkApiKeysStatus(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setStatuses(data);
      }
    }
    setIsLoading(false);
  };

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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">API Key Status</h1>
        <Button onClick={fetchData} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Refresh Status
        </Button>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4"/>
            <AlertTitle>Error Loading Status</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                         <div className="h-6 bg-muted rounded w-1/2"></div>
                         <div className="h-6 w-6 bg-muted rounded-full"></div>
                    </CardHeader>
                    <CardContent>
                         <div className="h-6 w-20 bg-muted rounded-full"></div>
                    </CardContent>
                </Card>
             ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {statuses.map(status => (
                <ApiStatusCard key={status.name} {...status} />
            ))}
        </div>
      )}
    </main>
  );
}

export default withAuth(ApiLimitPage);
