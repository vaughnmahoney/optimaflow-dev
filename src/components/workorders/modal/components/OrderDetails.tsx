
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { OrderDetailsTab } from "../tabs/OrderDetailsTab";
import { NotesTab } from "../tabs/NotesTab";
import { SignatureTab } from "../tabs/SignatureTab";
import { WorkOrder } from "../../types";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderDetailsProps {
  workOrder: WorkOrder;
}

export const OrderDetails = ({
  workOrder
}: OrderDetailsProps) => {
  const completionData = workOrder.completion_response?.orders[0]?.data;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto border-t">
        <Accordion type="single" collapsible defaultValue="details" className="w-full">
          <AccordionItem value="details" className="border-b">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <span className="text-sm font-medium">Order Details</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <Card className="p-0 border-0 shadow-none">
                <OrderDetailsTab workOrder={workOrder} />
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="notes" className="border-b">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <span className="text-sm font-medium">Notes</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <Card className="p-0 border-0 shadow-none">
                <NotesTab workOrder={workOrder} />
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="signature" className="border-b">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-900/50">
              <span className="text-sm font-medium">Signature</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <Card className="p-0 border-0 shadow-none">
                <SignatureTab workOrder={workOrder} />
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Tracking URL */}
      {completionData?.tracking_url && (
        <div className="p-4 border-t">
          <Button
            variant="outline" 
            className="w-full text-left flex items-center gap-2"
            onClick={() => window.open(completionData.tracking_url, '_blank')}
          >
            <Link className="h-4 w-4" />
            View Tracking URL
          </Button>
        </div>
      )}
    </div>
  );
};
