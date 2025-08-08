
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
            document.documentElement.style.colorScheme = systemTheme;
        } else {
            document.documentElement.classList.toggle('dark', t === 'dark');
            document.documentElement.style.colorScheme = t;
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

  const buttonBaseClass = "rounded-full h-8 flex-1 sm:flex-initial sm:w-auto hover:bg-accent/20 text-foreground";
  const iconBaseClass = "h-4 w-4";

  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-muted w-full sm:w-auto">
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('light')}
         className={cn(buttonBaseClass, theme === 'light' && "bg-background shadow-sm hover:bg-background")}
       >
         <Sun className={cn(iconBaseClass, theme === 'light' ? 'sm:mr-2' : 'mr-0 sm:mr-2')} />
         <span className={cn(theme !== 'light' && 'hidden sm:inline')}>Light</span>
       </Button>
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('dark')}
         className={cn(buttonBaseClass, theme === 'dark' && "bg-background shadow-sm hover:bg-background")}
       >
         <Moon className={cn(iconBaseClass, theme === 'dark' ? 'sm:mr-2' : 'mr-0 sm:mr-2')} />
         <span className={cn(theme !== 'dark' && 'hidden sm:inline')}>Dark</span>
       </Button>
       <Button 
         variant="ghost" 
         size="sm"
         onClick={() => handleThemeChange('system')}
         className={cn(buttonBaseClass, theme === 'system' && "bg-background shadow-sm hover:bg-background")}
       >
         <Monitor className={cn(iconBaseClass, theme === 'system' ? 'sm:mr-2' : 'mr-0 sm:mr-2')} />
         <span className={cn(theme !== 'system' && 'hidden sm:inline')}>System</span>
       </Button>
    </div>
  );
}
