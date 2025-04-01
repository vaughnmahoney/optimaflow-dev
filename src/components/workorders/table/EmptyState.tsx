
import { TableCell } from "@/components/ui/table";

export const EmptyState = () => {
  return (
    <div className="flex justify-center items-center p-8 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">No work orders found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search criteria or filters to find what you're looking for.
        </p>
      </div>
    </div>
  );
};
