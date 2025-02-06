import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Group } from "@/types/groups";

interface GroupSelectorProps {
  onGroupSelect: (groupId: string) => void;
  selectedGroupId?: string;
  disabled?: boolean;
}

export function GroupSelector({ onGroupSelect, selectedGroupId, disabled }: GroupSelectorProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setError(null);
        console.log("Fetching groups...");
        
        const { data, error } = await supabase
          .from("groups")
          .select("id, name, description")
          .order("name");

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Groups data received:", data);
        setGroups(data || []);
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to load groups";
        console.error("Error in fetchGroups:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [toast]);

  const handleAddGroupSuccess = (newGroup?: Group) => {
    if (newGroup) {
      setGroups((prev) => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)));
      onGroupSelect(newGroup.id);
    }
    setIsDialogOpen(false);
  };

  if (loading) {
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
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
          {!disabled && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDialogOpen(true);
                }}
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
        onSuccess={handleAddGroupSuccess}
      />
    </>
  );
}
