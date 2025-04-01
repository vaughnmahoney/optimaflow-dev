
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
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid grid-cols-3 mb-2 w-full">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="signature">Signature</TabsTrigger>
      </TabsList>
      
      {/* Details Tab */}
      <TabsContent value="details" className="mt-0">
        <MobileDetailsTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-0">
        <MobileNotesTab workOrder={workOrder} />
      </TabsContent>
      
      {/* Signature Tab */}
      <TabsContent value="signature" className="mt-0">
        <MobileSignatureTab workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
};
