import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn("px-4 py-3 border-b border-border", className)}>{children}</div>;
}

export function CardContent({ className, children }: CardProps) {
  return <div className={cn("px-4 py-3", className)}>{children}</div>;
}