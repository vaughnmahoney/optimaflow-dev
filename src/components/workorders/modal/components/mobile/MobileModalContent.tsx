
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../../types";
import { ImageType } from "../../../types/image";
import { MobileOrderDetails } from "./MobileOrderDetails";
import { Image } from "lucide-react";
import { QcNotesSheet } from "../QcNotesSheet";
import { ResolutionNotesSheet } from "../ResolutionNotesSheet";
import { MobileStatusButton } from "./MobileStatusButton";

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
      {/* Scrollable main content */}
      <ScrollArea className="flex-1 overflow-auto scrollbar-none">
        <div className="py-2">
          <MobileOrderDetails workOrder={workOrder} />
        </div>
      </ScrollArea>
      
      {/* Action buttons at the bottom */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 space-y-3">
        {/* View Images button and Status button in same row */}
        <div className="flex items-center justify-between gap-2">
          <Button 
            className="h-8 px-3 text-xs flex items-center justify-center gap-1 text-gray-600 hover:bg-gray-100"
            variant="ghost"
            onClick={onViewImages}
            disabled={!hasImages}
          >
            <div className="relative">
              <Image className="h-3.5 w-3.5" />
              {hasImages && images.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-200 text-gray-700 text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {images.length}
                </span>
              )}
            </div>
            <span>Images</span>
          </Button>
          
          {/* Status button aligned to the right */}
          <MobileStatusButton 
            workOrderId={workOrder.id}
            currentStatus={workOrder.status || "pending_review"}
            onStatusUpdate={onStatusUpdate}
          />
        </div>
        
        {/* Notes buttons - now below */}
        <div className="flex items-center justify-between gap-2">
          <QcNotesSheet workOrder={workOrder} />
          <ResolutionNotesSheet workOrder={workOrder} />
        </div>
      </div>
    </div>
  );
};
