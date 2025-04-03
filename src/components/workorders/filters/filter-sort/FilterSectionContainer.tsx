
import React from "react";

interface FilterSectionContainerProps {
  title: string;
  children: React.ReactNode;
}

export const FilterSectionContainer = ({ 
  title, 
  children 
}: FilterSectionContainerProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
};
