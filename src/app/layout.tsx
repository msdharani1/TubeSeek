import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'TubeSeek',
  description: 'An intelligent YouTube search experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", 'flex flex-col min-h-screen')}>
        <AuthProvider>
          <div className="flex-grow">
            {children}
          </div>
        </AuthProvider>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
