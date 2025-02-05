import { Layout } from "@/components/Layout";
import { GroupForm } from "@/components/groups/GroupForm";
import { GroupList } from "@/components/groups/GroupList";

const Groups = () => {
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
        <GroupList />
      </div>
    </Layout>
  );
};

export default Groups;