
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ActionButtonsProps {
  workOrderId: string;
  hasImages: boolean;
  onDownloadAll?: () => void;
}

export const ActionButtons = ({ 
  hasImages, 
  onDownloadAll 
}: ActionButtonsProps) => {
  return (
    <div className="p-6 border-t bg-background space-y-2 flex-shrink-0">
      {onDownloadAll && hasImages && (
        <Button 
          className="w-full justify-start"
          variant="outline"
          onClick={onDownloadAll}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All Images
        </Button>
      )}
    </div>
  );
};
