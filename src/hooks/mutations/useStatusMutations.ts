
// This file is now just a re-export of the refactored status module
// It's kept for backward compatibility with existing code
import { useStatusMutations as useRefactoredStatusMutations } from "./status";

/**
 * Hook for work order status-related mutations
 * @deprecated Use the refactored hooks in src/hooks/mutations/status instead
 */
export const useStatusMutations = useRefactoredStatusMutations;
