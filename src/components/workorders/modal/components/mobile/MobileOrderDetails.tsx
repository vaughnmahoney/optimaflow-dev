
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
    <Tabs defaultValue="details" className="w-full h-full">
      <TabsList className="grid grid-cols-3 mb-2 w-full bg-gray-50 rounded-md p-1 sticky top-0 z-10">
        <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
        <TabsTrigger value="notes" className="text-sm">Notes</TabsTrigger>
        <TabsTrigger value="signature" className="text-sm">Signature</TabsTrigger>
      </TabsList>
      
      {/* Details Tab */}
      <TabsContent value="details" className="mt-0 h-[calc(100%-40px)] overflow-auto">
        <MobileDetailsTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-0 h-[calc(100%-40px)] overflow-auto">
        <MobileNotesTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Signature Tab */}
      <TabsContent value="signature" className="mt-0 h-[calc(100%-40px)] overflow-auto">
        <MobileSignatureTab workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
};
