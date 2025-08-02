import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto py-4 px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          For educational purposes only.
        </p>
        <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
          Developed by{' '}
          <Link
            href="http://www.dev.msdharani.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            MS Dharani
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
