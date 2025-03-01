
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-100">
          <TabsList className="w-full rounded-none h-12 bg-gray-100">
            <TabsTrigger 
              value="details" 
              className="flex-1 rounded-none text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Order Details
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex-1 rounded-none text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger 
              value="signature" 
              className="flex-1 rounded-none text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Signature
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="details" className="m-0 h-full flex-1">
            <OrderDetailsTab workOrder={workOrder} />
          </TabsContent>
          
          <TabsContent value="notes" className="m-0 h-full flex-1">
            <NotesTab workOrder={workOrder} />
          </TabsContent>
          
          <TabsContent value="signature" className="m-0 h-full flex-1">
            <SignatureTab workOrder={workOrder} />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Tracking URL */}
      {completionData?.tracking_url && (
        <div className="p-4 border-t">
          <Button
            variant="outline" 
            className="w-full text-left flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
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
