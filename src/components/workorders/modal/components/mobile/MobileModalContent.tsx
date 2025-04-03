
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "../../../types";
import { ImageType } from "../../../types/image";
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
      {/* Scrollable main content */}
      <ScrollArea className="flex-1 overflow-auto scrollbar-none">
        <div className="py-2">
          <MobileOrderDetails workOrder={workOrder} />
        </div>
      </ScrollArea>
      
      {/* Action buttons at the bottom */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-900 space-y-3">
        {/* View Images & Download buttons - now first */}
        <div className="flex items-center gap-2">
          <Button 
            className="flex-1 justify-center items-center"
            variant="outline"
            onClick={onViewImages}
            disabled={!hasImages}
          >
            <Image className="mr-2 h-4 w-4" />
            {hasImages ? `(${images.length})` : '(0)'}
          </Button>
          
          {onDownloadAll && hasImages && (
            <Button 
              className="w-10 justify-center items-center aspect-square p-0"
              variant="outline"
              onClick={onDownloadAll}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download All</span>
            </Button>
          )}
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
