
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
  authors: [{ name: 'MS Dharani', url: 'https://www.dev.msdharani.com' }],
  creator: 'MS Dharani',
  publisher: 'Vercel',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "https://res.cloudinary.com/diwu3avy6/image/upload/favicon_rounded_cfld4n?_a=DATAdtAAZAA0",
    shortcut: "https://res.cloudinary.com/diwu3avy6/image/upload/favicon_rounded_cfld4n?_a=DATAdtAAZAA0",
    apple: "https://res.cloudinary.com/diwu3avy6/image/upload/favicon_rounded_cfld4n?_a=DATAdtAAZAA0",
  },
   openGraph: {
    title: 'TubeSeek | Intelligent YouTube Search',
    description: 'The best way to search for and watch YouTube videos without ads or distractions.',
    url: 'https://www.tubeseek.msdharani.com',
    siteName: 'TubeSeek',
    images: [
      {
        url: 'https://www.tubeseek.msdharani.com/og-image.png', // Must be an absolute URL
        width: 1200,
        height: 630,
        alt: 'TubeSeek Logo and Title',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TubeSeek | Intelligent YouTube Search',
    description: 'An ad-free, distraction-free portal to YouTube.',
    creator: '@msdharani007',
     images: ['https://www.tubeseek.msdharani.com/twitter-image.png'], // Must be an absolute URL
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Replace with your code
  },
  metadataBase: new URL('https://www.tubeseek.msdharani.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
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
}
