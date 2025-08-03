
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Playlist(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("w-6 h-6", props.className)}
      {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v8" />
        <path d="m9 10 3 -3 3 3" />
    </svg>
  );
}

export function PlusCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("w-6 h-6", props.className)}
      {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}


export function ListVideo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", props.className)}
      {...props}
    >
      <path d="M12 12H3" />
      <path d="M16 6H3" />
      <path d="M16 18H3" />
      <path d="m21 12-4-4v8z" />
    </svg>
  );
}
