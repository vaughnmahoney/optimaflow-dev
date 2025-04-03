
import { WorkOrder } from "../../../types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MobileDetailsTab } from "./tabs/MobileDetailsTab";
import { MobileNotesTab } from "./tabs/MobileNotesTab";
import { MobileSignatureTab } from "./tabs/MobileSignatureTab";

interface MobileOrderDetailsProps {
  workOrder: WorkOrder;
}

export const MobileOrderDetails = ({
  workOrder
}: MobileOrderDetailsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mb-0 w-full bg-gray-50 rounded-md p-1 sticky top-0 z-10 flex-shrink-0">
        <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
        <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
        <TabsTrigger value="signature" className="text-sm">Signature</TabsTrigger>
      </TabsList>
      
      {/* Details Tab - improved scroll handling */}
      <TabsContent value="details" className="mt-0 flex-1 overflow-auto px-0 py-2">
        <MobileDetailsTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Notes Tab - improved scroll handling */}
      <TabsContent value="notes" className="mt-0 flex-1 overflow-auto px-0 py-2">
        <MobileNotesTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Signature Tab - improved scroll handling */}
      <TabsContent value="signature" className="mt-0 flex-1 overflow-auto px-0 py-2">
        <MobileSignatureTab workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
};
