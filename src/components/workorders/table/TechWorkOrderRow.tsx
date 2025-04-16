
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { WorkOrder } from "../types";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Image, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatLocalTime } from "@/utils/dateUtils";

interface TechWorkOrderRowProps {
  workOrder: WorkOrder;
  onImageView: (id: string) => void;
  onAddNotes: (id: string) => void;
  onSafetyNotesClick?: (id: string) => void;
}

export const TechWorkOrderRow = ({ 
  workOrder, 
  onImageView, 
  onAddNotes,
  onSafetyNotesClick
}: TechWorkOrderRowProps) => {
  // Check if work order has images
  const hasImages = workOrder.completion_response?.orders?.[0]?.data?.form?.images?.length > 0;
  const hasSafetyNotes = !!workOrder.safety_notes;
  
  // Get date and format it
  const date = workOrder.service_date || workOrder.end_time || workOrder.timestamp;
  const formattedDate = formatLocalTime(date, "MMM d, yyyy", "N/A");
  
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{workOrder.order_no}</div>
        {workOrder.status && (
          <Badge 
            variant={workOrder.status === "approved" ? "success" : 
                    workOrder.status === "flagged" ? "destructive" : 
                    "outline"} 
            className="mt-1"
          >
            {workOrder.status}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          {workOrder.end_time && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {new Date(workOrder.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {workOrder.driver?.name || 'N/A'}
      </TableCell>
      <TableCell>
        {workOrder.location?.name || 'Unknown Location'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => hasImages && onImageView(workOrder.id)}
            disabled={!hasImages}
            className="h-8"
          >
            <Image className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only">View Images</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddNotes(workOrder.id)}
            className="h-8"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only">Add Notes</span>
          </Button>
          
          {onSafetyNotesClick && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSafetyNotesClick(workOrder.id)}
              className={`h-8 ${hasSafetyNotes ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 hover:text-blue-700' : ''}`}
            >
              <ShieldCheck className={`h-3.5 w-3.5 mr-1 ${hasSafetyNotes ? 'text-blue-500' : ''}`} />
              <span className="sr-only">Safety Notes</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
