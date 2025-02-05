import { useState } from "react";
import { GroupTable } from "./GroupTable";
import { GroupSearch } from "./GroupSearch";
import { useGroupMutations } from "@/hooks/useGroupMutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

export const GroupList = () => {
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { updateGroupMutation, removeGroupMutation } = useGroupMutations();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Group List</h3>
      <GroupSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <GroupTable
        groups={filteredGroups}
        editingGroup={editingGroup}
        setEditingGroup={setEditingGroup}
        onUpdate={(group) => {
          updateGroupMutation.mutate(group, {
            onSuccess: () => setEditingGroup(null),
          });
        }}
        onRemove={(id) => removeGroupMutation.mutate(id)}
        isUpdating={updateGroupMutation.isPending}
        isRemoving={removeGroupMutation.isPending}
      />
    </div>
  );
};