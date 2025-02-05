import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { Group } from "@/types/groups";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onSelect: (groupId: string) => void;
  onEdit: (group: Group) => void;
  onRemove: (groupId: string) => void;
}

export const GroupCard = ({
  group,
  isSelected,
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
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(group);
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(group.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
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