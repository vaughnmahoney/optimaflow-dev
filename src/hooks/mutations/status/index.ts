
import { useStatusUpdate } from "./useStatusUpdate";
import { useFlagResolution } from "./useFlagResolution";
import { useLocalStateUpdate } from "./useLocalStateUpdate";

/**
 * Combined hook for status-related mutations
 * Exports all status mutation functions
 */
export const useStatusMutations = () => {
  const { updateWorkOrderStatus } = useStatusUpdate();
  const { resolveWorkOrderFlag } = useFlagResolution();

  return {
    updateWorkOrderStatus,
    resolveWorkOrderFlag
  };
};

export { useStatusUpdate, useFlagResolution, useLocalStateUpdate };
