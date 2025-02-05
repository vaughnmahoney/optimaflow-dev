import { Group } from "@/types/groups";
import { GroupCard } from "./GroupCard";

interface GroupListProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onEditGroup: (group: Group) => void;
  onRemoveGroup: (groupId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export const GroupList = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onRemoveGroup,
  loading,
  error,
}: GroupListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-[200px] bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        {error}
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
          onSelect={onSelectGroup}
          onEdit={onEditGroup}
          onRemove={onRemoveGroup}
        />
      ))}
    </div>
  );
};