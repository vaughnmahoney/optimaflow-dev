
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
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </div>
  );
};
