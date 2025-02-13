
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const WorkOrderHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-primary">Work Orders</h2>
        <p className="mt-2 text-sm text-gray-600">
          Manage and track all work orders in the system
        </p>
      </div>
      <Button onClick={() => {}} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        New Work Order
      </Button>
    </div>
  );
};
