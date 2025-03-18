
import { Group } from "@/types/groups";
import { GroupCard } from "./GroupCard";
import { Loader2 } from "lucide-react";
import { useAttendanceCounts } from "@/hooks/useAttendanceCounts";

interface GroupListProps {
  groups: Group[];
  selectedGroupId?: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onEditGroup: (group: Group) => void;
  onRemoveGroup: (groupId: string) => void;
  loading?: boolean;
  error?: string | null;
  deletingGroupId?: string;
}

export const GroupList = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onRemoveGroup,
  loading,
  error,
  deletingGroupId,
}: GroupListProps) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: attendanceCounts } = useAttendanceCounts(groups, today);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-100 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!groups?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No groups found. Create your first group to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          isSelected={selectedGroupId === group.id}
          isDeleting={deletingGroupId === group.id}
          onSelect={onSelectGroup}
          onEdit={onEditGroup}
          onRemove={onRemoveGroup}
          completedCount={attendanceCounts?.[group.id]?.completed || 0}
          totalCount={attendanceCounts?.[group.id]?.total || 0}
        />
      ))}
    </div>
  );
};
