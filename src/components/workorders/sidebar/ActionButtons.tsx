
import { Button } from "@/components/ui/button";
import { CheckCircle, Flag, Download } from "lucide-react";
import { ActionButtonsProps } from "../types/sidebar";

export const ActionButtons = ({ onStatusUpdate, onDownloadAll }: ActionButtonsProps) => (
  <div className="space-y-2">
    <Button 
      variant="outline" 
      className="w-full justify-start" 
      onClick={() => onStatusUpdate('approved')}
    >
      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
      Mark as Approved
    </Button>
    <Button 
      variant="outline" 
      className="w-full justify-start"
      onClick={() => onStatusUpdate('flagged')}
    >
      <Flag className="mr-2 h-4 w-4 text-red-600" />
      Flag for Review
    </Button>
    <Button 
      variant="outline" 
      className="w-full justify-start"
      onClick={onDownloadAll}
    >
      <Download className="mr-2 h-4 w-4" />
      Download All Images
    </Button>
  </div>
);
