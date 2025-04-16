
import { TableCell, TableRow } from "@/components/ui/table";

export const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center h-24 text-gray-500">
        No work orders found. Import orders from OptimoRoute to get started.
      </TableCell>
    </TableRow>
  );
};
