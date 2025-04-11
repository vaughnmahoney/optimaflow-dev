
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface ViewDetailsButtonProps {
  orderNo: string;
}

export const ViewDetailsButton = ({ orderNo }: ViewDetailsButtonProps) => {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={`/order/${orderNo}`}>
        <Eye className="h-4 w-4 mr-1" />
        <span className="sr-only md:not-sr-only">View Details</span>
      </Link>
    </Button>
  );
};
