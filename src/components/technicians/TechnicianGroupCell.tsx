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
      const { data } = await supabase
        .from('groups')
        .select('name')
        .eq('id', tech.group_id)
        .single();
      return data;
    },
    enabled: !!tech.group_id,
  });

  return (
    <div className="w-[200px]">
      {isEditing ? (
        <GroupSelector
          selectedGroupId={tech.group_id || undefined}
          onGroupSelect={onGroupChange}
        />
      ) : (
        <span className="text-gray-700">
          {group?.name || 'No group assigned'}
        </span>
      )}
    </div>
  );
};