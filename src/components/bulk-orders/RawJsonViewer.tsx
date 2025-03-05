
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface RawJsonViewerProps {
  data: any;
  label?: string;
}

export const RawJsonViewer = ({ data, label = "View Raw JSON" }: RawJsonViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract some basic info for the dialog title if possible
  const getDialogTitle = () => {
    let titleInfo = "";
    
    // Try to get the order number
    const orderNo = data.data?.orderNo || 
                   data.order_no || 
                   (data.completionDetails && data.completionDetails.orderNo) || 
                   null;
    
    if (orderNo) {
      titleInfo += `Order #${orderNo}`;
      
      // Try to get the status if we got an order number
      const status = data.status || 
                     data.completion_status ||
                     (data.completionDetails && data.completionDetails.data && data.completionDetails.data.status) || 
                     null;
                     
      if (status) {
        titleInfo += ` - ${status}`;
      }
      
      return titleInfo;
    }
    
    // Default title if we couldn't extract info
    return "Raw JSON Data";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <ScrollArea className="h-full mt-4 border rounded-md">
          <pre className="p-4 text-xs whitespace-pre-wrap break-all overflow-auto bg-slate-50">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
