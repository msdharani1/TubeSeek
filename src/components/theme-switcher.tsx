
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
        setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const applyTheme = (t: Theme) => {
        if (t === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', systemTheme === 'dark');
        } else {
            document.documentElement.classList.toggle('dark', t === 'dark');
        }
    }
    
    applyTheme(theme);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            applyTheme('system');
        }
    }
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const buttonBaseClass = "rounded-full w-full h-8 hover:bg-muted/50 text-foreground";

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-muted">
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('light')}
         className={cn(buttonBaseClass, theme === 'light' && "bg-background shadow-sm")}
       >
         <Sun className="h-4 w-4 mr-2"/>
         Light
       </Button>
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('dark')}
         className={cn(buttonBaseClass, theme === 'dark' && "bg-background shadow-sm")}
       >
         <Moon className="h-4 w-4 mr-2"/>
         Dark
       </Button>
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('system')}
         className={cn(buttonBaseClass, theme === 'system' && "bg-background shadow-sm")}
       >
         <Monitor className="h-4 w-4 mr-2"/>
         System
       </Button>
    </div>
  );
}
