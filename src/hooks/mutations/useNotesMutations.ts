
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useNotesMutations = () => {
  const queryClient = useQueryClient();

  // Mutation for updating work order QC notes
  const updateWorkOrderQcNotes = async (workOrderId: string, qcNotes: string) => {
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        qc_notes: qcNotes,
        updated_at: new Date().toISOString()
      })
      .eq("id", workOrderId);

    if (error) throw error;
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({
      queryKey: ["workOrders"]
    });
    
    queryClient.invalidateQueries({
      queryKey: ["workOrder", workOrderId]
    });
    
    toast.success("QC notes updated successfully");
    return data;
  };

  // Mutation for updating work order resolution notes
  const updateWorkOrderResolutionNotes = async (workOrderId: string, resolutionNotes: string) => {
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        resolution_notes: resolutionNotes,
        updated_at: new Date().toISOString()
      })
      .eq("id", workOrderId);

    if (error) throw error;
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({
      queryKey: ["workOrders"]
    });
    
    queryClient.invalidateQueries({
      queryKey: ["workOrder", workOrderId]
    });
    
    toast.success("Resolution notes updated successfully");
    return data;
  };

  // Create a separate safety notes update function that doesn't use the field yet
  // This is a placeholder until we add the safety_notes column to the work_orders table
  const updateWorkOrderSafetyNotes = async (workOrderId: string, safetyNotes: string) => {
    // Since safety_notes column doesn't exist yet, we'll just store it in notes field temporarily
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        notes: `Safety Notes: ${safetyNotes}`,
        updated_at: new Date().toISOString()
      })
      .eq("id", workOrderId);

    if (error) throw error;
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({
      queryKey: ["workOrders"]
    });
    
    queryClient.invalidateQueries({
      queryKey: ["workOrder", workOrderId]
    });
    
    toast.success("Safety notes updated successfully");
    return data;
  };

  // Return all mutations in an object
  return {
    updateWorkOrderQcNotes: useMutation({
      mutationFn: ({ workOrderId, qcNotes }: { workOrderId: string; qcNotes: string }) => 
        updateWorkOrderQcNotes(workOrderId, qcNotes)
    }).mutateAsync,
    
    updateWorkOrderResolutionNotes: useMutation({
      mutationFn: ({ workOrderId, resolutionNotes }: { workOrderId: string; resolutionNotes: string }) => 
        updateWorkOrderResolutionNotes(workOrderId, resolutionNotes)
    }).mutateAsync,
    
    updateWorkOrderSafetyNotes: useMutation({
      mutationFn: ({ workOrderId, safetyNotes }: { workOrderId: string; safetyNotes: string }) => 
        updateWorkOrderSafetyNotes(workOrderId, safetyNotes)
    }).mutateAsync
  };
};
