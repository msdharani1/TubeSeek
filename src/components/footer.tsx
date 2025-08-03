
import Link from 'next/link';
import { Logo } from './logo';
import { Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background/95 border-t backdrop-blur-sm mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/search" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">TubeSeek</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              An intelligent, ad-free portal to YouTube. No shorts, just the content you want.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-primary transition-colors">Search</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Link href="https://github.com/dharani-msd" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-6 w-6" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="https://www.linkedin.com/in/ms-dharani-b83873256/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                 <Link href="https://x.com/msdharani_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-6 w-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TubeSeek. All Rights Reserved.</p>
           <p className="mt-1">
            Developed by{' '}
            <Link
              href="http://www.dev.msdharani.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              MS Dharani
            </Link>
            . This project is for educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
