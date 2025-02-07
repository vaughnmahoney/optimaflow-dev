
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
      className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-100 ${
        isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/20'
      }`}
      onClick={() => onSelect(group.id)}
    >
      <GroupActions
        group={group}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onRemove={onRemove}
      />
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{group.name}</CardTitle>
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
          className={`w-full transition-colors ${
            isSelected 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'text-primary hover:bg-primary/10'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Group'}
        </Button>
      </CardContent>
    </Card>
  );
};
