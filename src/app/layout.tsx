
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { AppLayout } from '@/components/app-layout';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: {
    default: "TubeSeek | Intelligent YouTube Search",
    template: "%s | TubeSeek"
  },
  description: 'An intelligent, ad-free, and distraction-free portal to YouTube. No ads, no shorts, just the content you want.',
  keywords: ["YouTube search", "ad-free YouTube", "video search", "intelligent search", "no shorts", "focused video watching"],
  icons: {
    icon: "https://res.cloudinary.com/diwu3avy6/image/upload/favicon_rounded_cfld4n?_a=DATAdtAAZAA0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/uuid@latest/dist/umd/uuidv4.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn("font-body antialiased", 'bg-background text-foreground')}>
        <AuthProvider>
          <SidebarProvider>
            <AppLayout>
                {children}
            </AppLayout>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );

