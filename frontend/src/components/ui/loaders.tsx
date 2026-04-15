import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "muted" | "white";
}

export function Spinner({ className, size = "md", variant = "primary", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted-foreground",
    white: "text-white",
  };

  return (
    <div className={cn("flex justify-center items-center", className)} {...props}>
      <Loader2 className={cn("animate-spin", sizeClasses[size], variantClasses[variant])} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full animate-pulse-ring bg-primary/20"></div>
        
        {/* Spinning circles */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card shadow-lg p-2 card-shadow border">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin-slow"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary animate-spin-slow-reverse"></div>
          
          <img 
            src="/logo.svg" 
            alt="AfriSio Logo" 
            className="h-10 w-10 animate-pulse object-contain" 
            onError={(e) => {
              // Fallback if logo not found
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* If no logo, use a star as fallback */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <h2 className="text-xl font-heading font-semibold text-foreground tracking-wider animate-pulse">
          CHARGEMENT...
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Préparation de votre espace AfriSio CI
        </p>
      </div>
    </div>
  );
}

// A full-screen page loader matching the brand aesthetics
export function DashboardLoader() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 animate-fade-in">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-primary/20 border-t-primary"></div>
        <div className="absolute inset-2 animate-spin-slow-reverse rounded-full border-4 border-secondary/20 border-t-secondary"></div>
        <div className="h-6 w-6 rounded-full bg-primary animate-pulse"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-4 w-32 rounded bg-muted animate-pulse"></div>
        <div className="h-3 w-48 rounded bg-muted/50 animate-pulse"></div>
      </div>
    </div>
  );
}

export function ComponentLoader() {
  return (
    <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground bg-muted/10 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm">Chargement des données...</span>
      </div>
    </div>
  );
}
