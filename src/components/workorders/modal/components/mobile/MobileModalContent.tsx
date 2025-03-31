
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../../types";
import { ImageType } from "../../../types/image";
import { MobileStatusButtons } from "./MobileStatusButtons";
import { MobileOrderDetails } from "./MobileOrderDetails";
import { Image, Download } from "lucide-react";
import { QcNotesSheet } from "../QcNotesSheet";
import { ResolutionNotesSheet } from "../ResolutionNotesSheet";

interface MobileModalContentProps {
  workOrder: WorkOrder;
  images: ImageType[];
  onViewImages: () => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
  onDownloadAll?: () => void;
  onResolveFlag?: (workOrderId: string, resolution: string) => void;
}

export const MobileModalContent = ({
  workOrder,
  images,
  onViewImages,
  onStatusUpdate,
  onDownloadAll,
  onResolveFlag,
}: MobileModalContentProps) => {
  const hasImages = images && images.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status update buttons at the top */}
      <MobileStatusButtons 
        workOrderId={workOrder.id}
        currentStatus={workOrder.status}
        onStatusUpdate={onStatusUpdate}
        onResolveFlag={onResolveFlag}
      />
      
      {/* Scrollable main content */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4">
          <MobileOrderDetails workOrder={workOrder} />
        </div>
      </ScrollArea>
      
      {/* Action buttons at the bottom */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 space-y-3">
        {/* Notes buttons */}
        <div className="flex items-center justify-between gap-2">
          <QcNotesSheet workOrder={workOrder} />
          <ResolutionNotesSheet workOrder={workOrder} />
        </div>
        
        {/* View Images & Download buttons */}
        <div className="flex items-center gap-2">
          <Button 
            className="w-full justify-center items-center"
            variant="outline"
            onClick={onViewImages}
            disabled={!hasImages}
          >
            <Image className="mr-2 h-4 w-4" />
            View Images {hasImages ? `(${images.length})` : '(0)'}
          </Button>
          
          {onDownloadAll && hasImages && (
            <Button 
              className="min-w-[130px] justify-center items-center"
              variant="outline"
              onClick={onDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
