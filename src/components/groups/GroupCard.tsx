import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Group } from "@/types/groups";
import { GroupStats } from "./GroupStats";
import { GroupActions } from "./GroupActions";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  isDeleting?: boolean;
  onSelect: (groupId: string) => void;
  onEdit: (group: Group) => void;
  onRemove: (groupId: string) => void;
}

export const GroupCard = ({
  group,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onRemove,
}: GroupCardProps) => {
  return (
    <Card 
      className={`group relative cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
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
        <CardTitle>{group.name}</CardTitle>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <GroupStats groupId={group.id} />
        <Button 
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Select Group'}
        </Button>
      </CardContent>
    </Card>
  );
};