
import { useGroupAddMutation } from "./mutations/useGroupAddMutation";
import { useGroupUpdateMutation } from "./mutations/useGroupUpdateMutation";
import { useGroupRemoveMutation } from "./mutations/useGroupRemoveMutation";

/**
 * Combined hook for group mutations
 * Serves as a facade for all the group mutation hooks
 */
export const useGroupMutations = () => {
  const addGroupMutation = useGroupAddMutation();
  const updateGroupMutation = useGroupUpdateMutation();
  const removeGroupMutation = useGroupRemoveMutation();

  return {
    addGroupMutation,
    updateGroupMutation,
    removeGroupMutation,
  };
};
