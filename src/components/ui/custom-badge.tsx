import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Extended badge styles including our custom variants with Tailwind classes
const customBadgeStyles = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      customVariant: {
        success: "bg-green-100 text-green-800 border border-green-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
        purple: "bg-purple-100 text-purple-800 border border-purple-200",
        warning: "bg-amber-100 text-amber-800 border border-amber-200",
        primary: "bg-indigo-100 text-indigo-800 border border-indigo-200",
      },
    },
  }
);

interface CustomBadgeProps {
  children: ReactNode;
  customVariant?: "success" | "info" | "purple" | "warning" | "primary";
  className?: string;
}

/**
 * CustomBadge component that wraps the standard Badge component
 * but applies custom styling based on our material type variants
 */
export function CustomBadge({ children, customVariant, className }: CustomBadgeProps) {
  // If we have a custom variant, apply it with associated styles
  if (customVariant) {
    return (
      <span className={cn(customBadgeStyles({ customVariant }), className)}>
        {children}
      </span>
    );
  }
  
  // Otherwise, use the default Badge with variant="outline"
  return (
    <Badge variant="outline" className={className}>
      {children}
    </Badge>
  );
}
