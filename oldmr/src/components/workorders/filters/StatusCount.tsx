
import React, { ReactNode } from "react";

interface StatusCountProps {
  count: number;
  label: string;
  icon: ReactNode;
}

export const StatusCount: React.FC<StatusCountProps> = ({
  count,
  label,
  icon,
}) => {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold">{count}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};
