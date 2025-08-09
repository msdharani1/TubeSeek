
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth, useAuth } from '@/context/auth-context';
import { getAllFeedback, updateBugStatus, type FeedbackEntry } from '@/app/actions/feedback';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, Bug, Star, Image as ImageIcon, Video, Check, User, Mail, Calendar, ArrowUpDown } from 'lucide-react';
import { RippleWaveLoader } from '@/components/ripple-wave-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [allSubmissions, setAllSubmissions] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null);
  
  // Filter and sort states
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('all'); // 'all', '1', '2', '3', '4', '5'
  const [bugStatusFilter, setBugStatusFilter] = useState('all'); // 'all', 'open', 'fixed'
  const [feedbackSort, setFeedbackSort] = useState('newest'); // 'newest', 'oldest'
  const [bugSort, setBugSort] = useState('newest'); // 'newest', 'oldest'

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
      const { data, error } = await getAllFeedback(user.email);
      if (error) {
        setError(error);
      } else if (data) {
        setAllSubmissions(data);
      }
    }
    setIsLoading(false);
  };
  
  const handleMarkAsFixed = async (id: string) => {
    if(!user?.email) return;
    
    setAllSubmissions(prev => prev.map(item => item.id === id ? {...item, status: 'fixed'} : item));

    const { success, error } = await updateBugStatus(user.email, id, 'fixed');
    if(success) {
        toast({ title: "Bug marked as fixed." });
    } else {
        setAllSubmissions(prev => prev.map(item => item.id === id ? {...item, status: 'open'} : item));
        toast({ variant: 'destructive', title: "Update Failed", description: error });
    }
  }

  const filteredAndSortedFeedbacks = useMemo(() => {
    return allSubmissions
      .filter(s => s.type === 'feedback')
      .filter(s => feedbackRatingFilter === 'all' || s.rating === parseInt(feedbackRatingFilter))
      .sort((a, b) => feedbackSort === 'newest' ? b.submittedAt - a.submittedAt : a.submittedAt - b.submittedAt);
  }, [allSubmissions, feedbackRatingFilter, feedbackSort]);

  const filteredAndSortedBugs = useMemo(() => {
    return allSubmissions
      .filter(s => s.type === 'bug')
      .filter(s => bugStatusFilter === 'all' || s.status === bugStatusFilter)
      .sort((a, b) => bugSort === 'newest' ? b.submittedAt - a.submittedAt : a.submittedAt - b.submittedAt);
  }, [allSubmissions, bugStatusFilter, bugSort]);


  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  if (authLoading || (!user && !authLoading) || user?.email !== "msdharaniofficial@gmail.com") {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center text-center bg-background">
            <RippleWaveLoader />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    );
  }

  return (
    <>
      <Dialog open={!!viewingAttachment} onOpenChange={(isOpen) => !isOpen && setViewingAttachment(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Attachment Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewingAttachment && isImage(viewingAttachment) && (
              <Image src={viewingAttachment} alt="Attachment preview" width={1280} height={720} className="rounded-md max-h-[80vh] w-auto object-contain mx-auto" />
            )}
            {viewingAttachment && isVideo(viewingAttachment) && (
              <video src={viewingAttachment} controls autoPlay className="rounded-md max-h-[80vh] w-full" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Feedback & Bug Reports</h1>

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
        <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feedback"><MessageSquare className="mr-2 h-4 w-4"/>Feedback ({filteredAndSortedFeedbacks.length})</TabsTrigger>
                <TabsTrigger value="bug"><Bug className="mr-2 h-4 w-4"/>Bug Reports ({filteredAndSortedBugs.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="feedback" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Feedback</CardTitle>
                        <CardDescription>General feedback and ratings submitted by users.</CardDescription>
                         <div className="flex items-center gap-4 pt-4">
                            <Select value={feedbackRatingFilter} onValueChange={setFeedbackRatingFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    {[5,4,3,2,1].map(r => (
                                        <SelectItem key={r} value={String(r)}>{r} Star{r>1 && 's'}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Select value={feedbackSort} onValueChange={setFeedbackSort}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Submitted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedFeedbacks.length > 0 ? filteredAndSortedFeedbacks.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {Array.from({length: item.rating || 0}).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400"/>
                                                ))}
                                                {Array.from({length: 5 - (item.rating || 0)}).map((_, i) => (
                                                     <Star key={i} className="h-4 w-4 text-muted-foreground/50"/>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{item.name || 'Anonymous'}</div>
                                            <div className="text-xs text-muted-foreground">{item.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-md">{item.message}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No feedback matches your filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="bug" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Bug Reports</CardTitle>
                        <CardDescription>Reports submitted by users, potentially with attachments.</CardDescription>
                         <div className="flex items-center gap-4 pt-4">
                            <Select value={bugStatusFilter} onValueChange={setBugStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="fixed">Fixed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={bugSort} onValueChange={setBugSort}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {filteredAndSortedBugs.length > 0 ? filteredAndSortedBugs.map(item => (
                           <Card key={item.id} className={item.status === 'fixed' ? 'bg-muted/30' : ''}>
                            <CardContent className="p-4 grid md:grid-cols-3 gap-4">
                               <div className="md:col-span-2 space-y-3">
                                  <p className="text-sm">{item.message}</p>
                                   <div className="flex flex-wrap gap-2 items-center mt-2">
                                     {item.attachmentUrls && item.attachmentUrls.map((url, index) => (
                                        <Button asChild variant="outline" size="sm" key={index} onClick={() => setViewingAttachment(url)}>
                                            <div className="cursor-pointer">
                                                {isVideo(url) ? <Video className="h-4 w-4 mr-2"/> : <ImageIcon className="h-4 w-4 mr-2"/>}
                                                View Attachment {index + 1}
                                            </div>
                                        </Button>
                                     ))}
                                    </div>
                                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t mt-3">
                                    <span className="flex items-center gap-1.5"><User className="h-3 w-3"/>{item.name || 'Anonymous'}</span>
                                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3"/>{item.email}</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3"/>{formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}</span>
                                  </div>
                               </div>
                               <div className="flex md:flex-col items-start md:items-end justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                    {item.status === 'fixed' ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                            <Check className="h-3 w-3 mr-1"/> Fixed
                                        </Badge>
                                    ) : (
                                        <Button size="sm" onClick={() => handleMarkAsFixed(item.id)}>
                                            <Check className="h-4 w-4 mr-2"/> Mark as Fixed
                                        </Button>
                                    )}
                                    </div>
                               </div>
                            </CardContent>
                           </Card>
                       )) : (
                          <div className="h-24 text-center flex items-center justify-center text-muted-foreground">No bug reports match your filters.</div>
                       )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        )}
    </main>
    </>
  );
}

export default withAuth(FeedbackPage);
