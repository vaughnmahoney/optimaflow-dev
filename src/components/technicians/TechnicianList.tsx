
import { useState } from "react";
import { TechnicianTable } from "./TechnicianTable";
import type { Technician } from "@/types/attendance";
import { useTechnicianMutations } from "@/hooks/useTechnicianMutations";

interface TechnicianListProps {
  technicians: Technician[];
  isLoading: boolean;
}

export const TechnicianList = ({ technicians, isLoading }: TechnicianListProps) => {
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const { updateTechnicianMutation, removeTechnicianMutation } = useTechnicianMutations();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Technician List</h3>
      <TechnicianTable
        technicians={technicians}
        editingTechnician={editingTechnician}
        setEditingTechnician={setEditingTechnician}
        onUpdate={(technician) => {
          updateTechnicianMutation.mutate(technician, {
            onSuccess: () => setEditingTechnician(null),
          });
        }}
        onRemove={(id) => removeTechnicianMutation.mutate(id)}
        isUpdating={updateTechnicianMutation.isPending}
        isRemoving={removeTechnicianMutation.isPending}
      />
    </div>
  );
};
