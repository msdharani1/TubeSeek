
"use client";

import { useState, useEffect } from "react";
import type { Subscription } from "@/types/youtube";
import { getSubscriptions, toggleSubscription } from "@/app/actions/video-interactions";
import { withAuth, useAuth } from '@/context/auth-context';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tv, Frown, Loader2, BellRing, LogIn } from "lucide-react";

type CachedSubscriptions = {
    timestamp: number;
    subscriptions: Subscription[];
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function SubscriptionCard({ channel, onUnsubscribe }: { channel: Subscription, onUnsubscribe: (channel: Subscription) => void }) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <p className="font-semibold">{channel.channelTitle}</p>
                <Button variant="secondary" onClick={() => onUnsubscribe(channel)}>
                    <BellRing className="mr-2 h-4 w-4" />
                    Subscribed
                </Button>
            </CardContent>
        </Card>
    )
}

function SubscriptionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSubscriptions();
        } else {
            setIsLoading(false);
            setSubscriptions([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        if (!user) return;

        const cacheKey = `subscriptions_cache_${user.uid}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
             try {
                const { timestamp, subscriptions: cachedSubs }: CachedSubscriptions = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setSubscriptions(cachedSubs);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse subscriptions cache", e);
                localStorage.removeItem(cacheKey);
            }
        }
        
        const { data, error } = await getSubscriptions(user.uid);
        if (error) {
            toast({
                variant: "destructive",
                title: "Failed to load subscriptions",
                description: error,
            });
        } else if (data) {
            setSubscriptions(data);
             const dataToCache: CachedSubscriptions = {
                timestamp: Date.now(),
                subscriptions: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        }
        setIsLoading(false);
    };

    const handleUnsubscribe = async (channel: Subscription) => {
        if (!user) return;
        // Optimistically update UI
        setSubscriptions(prev => prev.filter(c => c.channelId !== channel.channelId));
        
        const { error } = await toggleSubscription(user.uid, channel.channelId, channel.channelTitle);
        
        if (error) {
            // Revert on error
            setSubscriptions(prev => [...prev, channel].sort((a,b) => b.subscribedAt - a.subscribedAt));
            toast({ variant: "destructive", title: "Failed to unsubscribe", description: error });
        } else {
            // Invalidate cache on successful action
            localStorage.removeItem(`subscriptions_cache_${user.uid}`);
            toast({ title: `Unsubscribed from "${channel.channelTitle}"` });
        }
    }

    if (!user && !isLoading) {
       return (
         <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center gap-4 mt-20">
            <Tv className="w-16 h-16 text-muted-foreground"/>
            <h2 className="text-2xl font-semibold">Your Subscriptions</h2>
            <p className="max-w-md text-muted-foreground">Sign in to subscribe to your favorite channels. New videos from your subscriptions will show up in your feed.</p>
            <Button onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4"/>
                Sign In
            </Button>
        </div>
       )
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Tv className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">My Subscriptions</h1>
                </div>
            </div>
            
            {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map(channel => (
                        <SubscriptionCard key={channel.channelId} channel={channel} onUnsubscribe={handleUnsubscribe} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center gap-4 mt-20">
                    <Frown className="w-16 h-16"/>
                    <h2 className="text-2xl font-semibold">No Subscriptions Yet</h2>
                    <p>Channels you subscribe to will appear here.</p>
                    <Button onClick={() => router.push('/search')}>Find Channels to Subscribe To</Button>
                </div>
            )}
        </main>
    );
}

export default withAuth(SubscriptionsPage);
