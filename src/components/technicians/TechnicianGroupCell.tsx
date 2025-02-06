
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GroupSelector } from "@/components/groups/GroupSelector";
import type { Technician } from "@/types/attendance";

interface TechnicianGroupCellProps {
  tech: Technician;
  isEditing: boolean;
  onGroupChange: (groupId: string) => void;
}

export const TechnicianGroupCell = ({
  tech,
  isEditing,
  onGroupChange,
}: TechnicianGroupCellProps) => {
  const { data: group } = useQuery({
    queryKey: ['group', tech.group_id],
    queryFn: async () => {
      if (!tech.group_id) return null;
      const { data, error } = await supabase
        .from('groups')
        .select('name')
        .eq('id', tech.group_id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tech.group_id,
  });

  const handleGroupSelect = (groupId: string) => {
    if (groupId !== tech.group_id) {
      onGroupChange(groupId);
    }
  };

  return (
    <div className="w-[200px]">
      {isEditing ? (
        <GroupSelector
          selectedGroupId={tech.group_id}
          onGroupSelect={handleGroupSelect}
        />
      ) : (
        <span className="text-gray-700">
          {group?.name || 'No group assigned'}
        </span>
      )}
    </div>
  );
};
