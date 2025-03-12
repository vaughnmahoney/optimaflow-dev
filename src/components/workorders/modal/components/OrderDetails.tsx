
import { OrderDetailsTab } from "../tabs/OrderDetailsTab";
import { NotesTab } from "../tabs/NotesTab";
import { SignatureTab } from "../tabs/SignatureTab";
import { WorkOrder } from "../../types";
import { Link, FileText, MessageSquare, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QcNotesSheet } from "./QcNotesSheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OrderDetailsProps {
  workOrder: WorkOrder;
}

export const OrderDetails = ({
  workOrder
}: OrderDetailsProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;
  const trackingUrl = completionData?.tracking_url;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gray-100">
        <div className="w-full h-12 bg-gray-100 flex">
          <div className="flex-1 rounded-none text-gray-900 bg-gray-100 font-medium flex items-center gap-2 justify-center">
            <FileText className="h-4 w-4" />
            Order Information
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-4 pt-4">
          {/* Order Details Section */}
          <div id="details-section" className="px-4 pb-6">
            <div className="mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Order Details
              </h3>
            </div>
            <OrderDetailsTab workOrder={workOrder} />
          </div>
          
          {/* Notes Section */}
          <div id="notes-section" className="px-4 pb-6">
            <div className="mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                Notes
              </h3>
            </div>
            <NotesTab workOrder={workOrder} />
          </div>
          
          {/* Signature Section */}
          <div id="signature-section" className="px-4 pb-6">
            <div className="mb-4 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-gray-500" />
                Signature
              </h3>
            </div>
            <SignatureTab workOrder={workOrder} />
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer with tracking URL and QC Notes */}
      <div className="p-4 border-t flex items-center justify-between bg-gray-50">
        <QcNotesSheet workOrder={workOrder} />
        
        {trackingUrl ? (
          <Button 
            variant="outline" 
            className="text-left flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border-gray-200" 
            onClick={() => window.open(trackingUrl, '_blank')}
          >
            <Link className="h-4 w-4" />
            View Tracking URL
          </Button>
        ) : (
          <div></div> // Empty div for spacing when no tracking URL
        )}
      </div>
    </div>
  );
};
