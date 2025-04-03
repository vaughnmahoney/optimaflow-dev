
import React from "react";
import { Button } from "@/components/ui/button";

interface FilterOptionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export const FilterOption = ({ 
  label, 
  isActive, 
  onClick, 
  className 
}: FilterOptionProps) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={className}
    >
      {label}
    </Button>
  );
};
