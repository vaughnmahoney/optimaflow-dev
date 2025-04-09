
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportFilterBoxProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const ReportFilterBox: React.FC<ReportFilterBoxProps> = ({
  children,
  title,
  description,
  icon,
  defaultExpanded = true,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div 
        className="p-4 bg-muted/50 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-300",
        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
