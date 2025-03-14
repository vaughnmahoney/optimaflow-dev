import { useState } from "react";
import { TechnicianTable } from "./TechnicianTable";
import { TechnicianSearch } from "./TechnicianSearch";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Technician } from "@/types/attendance";
import { useTechnicianMutations } from "@/hooks/useTechnicianMutations";
import { DeleteTechnicianDialog } from "./DeleteTechnicianDialog";

interface TechnicianListProps {
  technicians: Technician[];
  isLoading: boolean;
}

export const TechnicianList = ({ technicians, isLoading }: TechnicianListProps) => {
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [techToDelete, setTechToDelete] = useState<string | null>(null);
  const { updateTechnicianMutation, removeTechnicianMutation } = useTechnicianMutations();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (techToDelete) {
      await removeTechnicianMutation.mutate(techToDelete);
    } else if (selectedTechnicians.length > 0) {
      // Remove technicians one by one
      for (const techId of selectedTechnicians) {
        await removeTechnicianMutation.mutate(techId);
      }
      setSelectedTechnicians([]);
    }
    setDeleteDialogOpen(false);
    setTechToDelete(null);
  };

  const handleDeleteClick = (techId: string) => {
    setTechToDelete(techId);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setTechToDelete(null);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Technician List</h3>
        {selectedTechnicians.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDeleteClick}
            disabled={removeTechnicianMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedTechnicians.length})
          </Button>
        )}
      </div>
      <TechnicianSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <TechnicianTable
        technicians={filteredTechnicians}
        editingTechnician={editingTechnician}
        setEditingTechnician={setEditingTechnician}
        onUpdate={(technician) => {
          updateTechnicianMutation.mutate(technician, {
            onSuccess: () => setEditingTechnician(null),
          });
        }}
        onRemove={handleDeleteClick}
        isUpdating={updateTechnicianMutation.isPending}
        isRemoving={removeTechnicianMutation.isPending}
        selectedTechnicians={selectedTechnicians}
        setSelectedTechnicians={setSelectedTechnicians}
      />
      <DeleteTechnicianDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTechToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isMultiple={!techToDelete && selectedTechnicians.length > 0}
      />
    </div>
  );
};