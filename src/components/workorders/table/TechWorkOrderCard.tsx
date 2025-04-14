
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Image, MapPin, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "../types";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface TechWorkOrderCardProps {
  workOrder: WorkOrder;
  onImageView: (id: string) => void;
  onAddNotes: (id: string) => void;
  onSafetyNotesClick?: (id: string) => void;
}

export const TechWorkOrderCard = ({ 
  workOrder, 
  onImageView, 
  onAddNotes,
  onSafetyNotesClick
}: TechWorkOrderCardProps) => {
  // Check if work order has images
  const hasImages = workOrder.completion_response?.orders?.[0]?.data?.form?.images?.length > 0;
  const hasSafetyNotes = !!workOrder.safety_notes;
  
  // Get date and format it
  const date = workOrder.service_date || workOrder.end_time || workOrder.timestamp;
  const formattedDate = formatDateForDisplay(date);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">{workOrder.order_no}</h3>
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
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            
            {workOrder.end_time && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{new Date(workOrder.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{workOrder.driver?.name || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{workOrder.location?.name || 'Unknown Location'}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-muted/20 gap-2 justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => hasImages && onImageView(workOrder.id)}
          disabled={!hasImages}
          className="h-8 flex-1"
        >
          <Image className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Images</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onAddNotes(workOrder.id)}
          className="h-8 flex-1"
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Notes</span>
        </Button>
        
        {onSafetyNotesClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSafetyNotesClick(workOrder.id)}
            className={`h-8 flex-1 ${hasSafetyNotes ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 hover:text-blue-700' : ''}`}
          >
            <ShieldCheck className={`h-3.5 w-3.5 mr-1 ${hasSafetyNotes ? 'text-blue-500' : ''}`} />
            <span className="text-xs">Safety</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
