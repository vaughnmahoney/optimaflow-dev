
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Group } from "@/types/groups";
import { GroupStats } from "./GroupStats";
import { GroupActions } from "./GroupActions";
import { GroupReviewStatus } from "./GroupReviewStatus";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  isDeleting?: boolean;
  onSelect: (groupId: string) => void;
  onEdit: (group: Group) => void;
  onRemove: (groupId: string) => void;
  completedCount?: number;
  totalCount?: number;
}

export const GroupCard = ({
  group,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onRemove,
  completedCount = 0,
  totalCount = 0,
}: GroupCardProps) => {
  return (
    <Card 
      className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      } bg-white rounded-xl border border-gray-200`}
      onClick={() => onSelect(group.id)}
    >
      <GroupActions
        group={group}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onRemove={onRemove}
      />
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-gray-900">{group.name}</CardTitle>
        {group.description && (
          <CardDescription className="text-sm text-gray-500">{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <GroupStats groupId={group.id} />
        <GroupReviewStatus
          groupId={group.id}
          completedCount={completedCount}
          totalCount={totalCount}
          className="pt-2"
        />
        <Button 
          variant={isSelected ? "default" : "outline"}
          className={`w-full transition-colors duration-200 ${
            isSelected ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Group'}
        </Button>
      </CardContent>
    </Card>
  );
};
