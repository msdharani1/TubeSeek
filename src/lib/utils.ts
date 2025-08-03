import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(isoDuration: string): string {
  if (!isoDuration) return '';

  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '0:00';

  matches.shift(); 
  const [hours, minutes, seconds] = matches.map(val => (val ? parseInt(val, 10) : 0));

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatCount(count: string | number): string {
  const num = Number(count);
  if (isNaN(num)) {
    return '0';
  }

  if (num < 1000) {
    return num.toString();
  } else if (num < 1000000) {
    const value = num / 1000;
    return value.toFixed(value < 10 ? 1 : 0) + 'K';
  } else if (num < 1000000000) {
    const value = num / 1000000;
    return value.toFixed(value < 10 ? 1 : 0) + 'M';
  } else {
    const value = num / 1000000000;
    return value.toFixed(value < 10 ? 1 : 0) + 'B';
  }
}
