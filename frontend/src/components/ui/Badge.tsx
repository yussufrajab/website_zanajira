import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface text-muted border-border",
  success: "bg-green-50 text-success border-green-200",
  warning: "bg-yellow-50 text-warning border-yellow-200",
  error: "bg-red-50 text-error border-red-200",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}