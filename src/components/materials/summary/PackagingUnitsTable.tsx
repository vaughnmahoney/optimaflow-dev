
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PackagingUnit {
  label: string;
  count: number;
  unit: string;
}

interface PackagingUnitsTableProps {
  packagingUnits: Record<string, PackagingUnit>;
}

export const PackagingUnitsTable = ({ packagingUnits }: PackagingUnitsTableProps) => {
  if (Object.keys(packagingUnits).length === 0) {
    return null;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Filter Type</TableHead>
          <TableHead className="text-right">Units Needed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(packagingUnits).map((unit, index) => (
          <TableRow key={index}>
            <TableCell>{unit.label}</TableCell>
            <TableCell className="text-right font-medium">
              {unit.count} {unit.unit}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
