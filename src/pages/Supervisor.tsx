import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";
import { GroupForm } from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Group {
  id: string;
  name: string;
  description: string | null;
}

const Supervisor = () => {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

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
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">Supervisor Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Select a group and mark attendance for your team
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
              </DialogHeader>
              <GroupForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mt-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card 
                key={group.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedGroupId === group.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  {group.description && (
                    <CardDescription>{group.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={selectedGroupId === group.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    {selectedGroupId === group.id ? 'Selected' : 'Select Group'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedGroupId && <AttendanceForm groupId={selectedGroupId} />}
        
        {!selectedGroupId && (
          <div className="text-center text-gray-500 mt-8">
            Please select a group to view and manage attendance
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Supervisor;