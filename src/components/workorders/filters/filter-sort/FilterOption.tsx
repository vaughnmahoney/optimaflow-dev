
import React from "react";
import { cn } from "@/lib/utils";

interface FilterOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const FilterOption = ({ 
  label, 
  isActive, 
  onClick, 
  className,
  icon
}: FilterOptionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all",
        isActive 
          ? "bg-primary text-primary-foreground font-medium" 
          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
};
