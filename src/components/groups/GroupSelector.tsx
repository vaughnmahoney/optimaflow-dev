import { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
}

interface GroupSelectorProps {
  onGroupSelect: (groupId: string) => void;
  selectedGroupId?: string;
}

export function GroupSelector({ onGroupSelect, selectedGroupId }: GroupSelectorProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setError(null);
        console.log("Fetching groups...");
        
        const { data, error } = await supabase
          .from("groups")
          .select("id, name")
          .order("name")
          .returns<Group[]>();

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

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);

  if (loading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Loading groups...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {error ? "Error loading groups" : selectedGroup?.name || "Select a group..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandEmpty>
            {error ? "Failed to load groups" : "No groups found."}
          </CommandEmpty>
          <CommandGroup>
            {(groups || []).map((group) => (
              <CommandItem
                key={group.id}
                onSelect={() => {
                  onGroupSelect(group.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selectedGroupId === group.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                {group.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}