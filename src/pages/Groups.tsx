import { useState } from "react";
import { Layout } from "@/components/Layout";
import { GroupForm } from "@/components/groups/GroupForm";
import { GroupList } from "@/components/groups/GroupList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";

const Groups = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const { toast } = useToast();

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Group[];
    }
  });

  const handleEditGroup = (group: Group) => {
    toast({
      title: "Edit group",
      description: "This feature is not implemented yet.",
    });
  };

  const handleRemoveGroup = (groupId: string) => {
    toast({
      title: "Remove group",
      description: "This feature is not implemented yet.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Group Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage groups for your technicians
          </p>
        </div>
        
        <GroupForm />
        <GroupList 
          groups={groups || []}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onEditGroup={handleEditGroup}
          onRemoveGroup={handleRemoveGroup}
          loading={isLoading}
          error={error?.message}
        />
      </div>
    </Layout>
  );
};

export default Groups;