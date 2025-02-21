
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDetailsTab } from "../tabs/OrderDetailsTab";
import { NotesTab } from "../tabs/NotesTab";
import { SignatureTab } from "../tabs/SignatureTab";
import { WorkOrder } from "../../types";

interface TabsContainerProps {
  workOrder: WorkOrder;
}

export const TabsContainer = ({ workOrder }: TabsContainerProps) => {
  return (
    <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
      <TabsList className="px-6 pt-2 justify-start border-b rounded-none gap-4">
        <TabsTrigger value="details">Order Details</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="signature">Signature</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="details" className="m-0 p-6">
          <OrderDetailsTab workOrder={workOrder} />
        </TabsContent>
        <TabsContent value="notes" className="m-0 p-6">
          <NotesTab workOrder={workOrder} />
        </TabsContent>
        <TabsContent value="signature" className="m-0 p-6">
          <SignatureTab workOrder={workOrder} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
