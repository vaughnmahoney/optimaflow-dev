
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const SimpleTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Order #</TableHead>
        <TableHead>Service Date</TableHead>
        <TableHead>Driver</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
