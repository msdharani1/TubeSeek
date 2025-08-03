
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SettingsCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function SettingsCard({ title, description, children, className, icon }: SettingsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start gap-4">
            {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
            <div className="flex-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type SettingsItemProps = {
    children: ReactNode;
    className?: string;
}

export function SettingsItem({ children, className } : SettingsItemProps) {
    return (
        <div className={cn("flex items-center justify-between py-3", className)}>
            {children}
        </div>
    )
}

type SettingsLinkItemProps = {
    href: string;
    children: ReactNode;
}

export function SettingsLinkItem({ href, children }: SettingsLinkItemProps) {
    return (
        <Link href={href} className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-6 px-6 cursor-pointer">
            <span className="font-medium">{children}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
    )
}
