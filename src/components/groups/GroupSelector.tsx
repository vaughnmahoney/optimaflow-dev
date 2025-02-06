
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroupDialog } from "./GroupDialog";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GroupSelectorProps {
  onGroupSelect: (groupId: string) => void;
  selectedGroupId?: string;
  disabled?: boolean;
}

export function GroupSelector({ onGroupSelect, selectedGroupId, disabled }: GroupSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, description")
        .order("name");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      return data as Group[];
    }
  });

  const handleAddGroupSuccess = async (newGroup?: Group) => {
    if (newGroup) {
      // Close the dialog first
      setIsDialogOpen(false);
      
      // Invalidate and refetch groups
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      
      // Update the selection
      onGroupSelect(newGroup.id);
      
      toast({
        title: "Group created",
        description: "New group has been created successfully.",
      });
    }
  };

  const handleAddNewGroup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading groups..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Error loading groups" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <>
      <Select 
        value={selectedGroupId} 
        onValueChange={onGroupSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a group..." />
        </SelectTrigger>
        <SelectContent>
          {(groups || []).map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
          {!disabled && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleAddNewGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Group
              </Button>
            </div>
          )}
        </SelectContent>
      </Select>

      <GroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Add New Group"
        description="Create a new group for organizing technicians."
        onSuccess={handleAddGroupSuccess}
      />
    </>
  );
}
