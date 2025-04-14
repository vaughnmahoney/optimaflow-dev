
import { useStatusMutations } from "./mutations/useStatusMutations";
import { useNotesMutations } from "./mutations/useNotesMutations";
import { useImageMutations } from "./mutations/useImageMutations";
import { useWorkOrderDeleteMutation } from "./mutations/useWorkOrderDeleteMutation";

/**
 * Combined hook for work order mutations
 * Serves as a facade for all the mutation hooks for backward compatibility
 */
export const useWorkOrderMutations = () => {
  const statusMutations = useStatusMutations();
  const notesMutations = useNotesMutations();
  const imageMutations = useImageMutations();
  const deleteMutation = useWorkOrderDeleteMutation();

  return {
    // Status mutations
    updateWorkOrderStatus: statusMutations.updateWorkOrderStatus,
    resolveWorkOrderFlag: statusMutations.resolveWorkOrderFlag,
    
    // Notes mutations
    updateWorkOrderQcNotes: notesMutations.updateWorkOrderQcNotes,
    updateWorkOrderResolutionNotes: notesMutations.updateWorkOrderResolutionNotes,
    updateWorkOrderSafetyNotes: notesMutations.updateWorkOrderSafetyNotes,
    
    // Image mutations
    toggleImageFlag: imageMutations.toggleImageFlag,
    
    // Delete mutation
    deleteWorkOrder: deleteMutation.deleteWorkOrder
  };
};
