
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface StatusFilterCardsProps {
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
}

export const StatusFilterCards = ({
  statusFilter,
  onStatusFilterChange,
}: StatusFilterCardsProps) => {
  const statuses = [
    { label: "Pending Review", value: "pending_review" },
    { label: "Approved", value: "approved" },
    { label: "Flagged", value: "flagged" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
      {statuses.map((status) => (
        <Card 
          key={status.value}
          className={`cursor-pointer transition-all overflow-hidden ${
            statusFilter === status.value 
              ? "ring-2 ring-black ring-offset-2" // Changed from sidebar-accent to black
              : "hover:shadow-md"
          }`}
          onClick={() => onStatusFilterChange(
            statusFilter === status.value ? null : status.value
          )}
        >
          <div 
            className="h-1 w-full bg-black" // Changed from sidebar-accent to black
            aria-hidden="true"
          />
          <CardContent className="p-4 text-center">
            <h3 className="font-medium">{status.label}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
