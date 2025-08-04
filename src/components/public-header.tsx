
"use client";

import Link from "next/link";
import { Logo } from "./logo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Go to homepage" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground font-headline hidden sm:inline-block">
                TubeSeek
            </span>
        </Link>
      </div>
    </header>
  );
}
