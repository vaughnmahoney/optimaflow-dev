
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Technician } from "@/types/attendance";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  // Fetch technicians
  const { data: technicians, isLoading } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Technician[];
    },
  });

  // Add technician mutation
  const addTechnicianMutation = useMutation({
    mutationFn: async (technicianData: Omit<Technician, "id" | "created_at" | "updated_at" | "supervisor_id">) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("technicians")
        .insert([{ ...technicianData, supervisor_id: user.data.user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      setNewTechnician({ name: "", email: "", phone: "" });
      toast({
        title: "Technician added",
        description: "The technician has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding technician:", error);
    },
  });

  // Update technician mutation
  const updateTechnicianMutation = useMutation({
    mutationFn: async (technician: Technician) => {
      const { data, error } = await supabase
        .from("technicians")
        .update({
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
        })
        .eq("id", technician.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      setEditingTechnician(null);
      toast({
        title: "Technician updated",
        description: "The technician has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating technician:", error);
    },
  });

  // Remove technician mutation
  const removeTechnicianMutation = useMutation({
    mutationFn: async (technicianId: string) => {
      const { error } = await supabase
        .from("technicians")
        .delete()
        .eq("id", technicianId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Technician removed",
        description: "The technician has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove technician. Please try again.",
        variant: "destructive",
      });
      console.error("Error removing technician:", error);
    },
  });

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnicianMutation.mutate(newTechnician);
  };

  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician);
  };

  const handleUpdateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTechnician) {
      updateTechnicianMutation.mutate(editingTechnician);
    }
  };

  const handleCancelEdit = () => {
    setEditingTechnician(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage technicians and view attendance records
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Technician</h3>
          <form onSubmit={handleAddTechnician} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  value={newTechnician.name}
                  onChange={(e) =>
                    setNewTechnician({ ...newTechnician, name: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={newTechnician.email}
                  onChange={(e) =>
                    setNewTechnician({ ...newTechnician, email: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={newTechnician.phone}
                  onChange={(e) =>
                    setNewTechnician({ ...newTechnician, phone: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
            <Button 
              type="submit"
              disabled={addTechnicianMutation.isPending}
            >
              {addTechnicianMutation.isPending ? "Adding..." : "Add Technician"}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Technician List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians?.map((tech) => (
                  <tr key={tech.id} className="border-b">
                    <td className="py-3 px-4">
                      {editingTechnician?.id === tech.id ? (
                        <Input
                          value={editingTechnician.name}
                          onChange={(e) =>
                            setEditingTechnician({
                              ...editingTechnician,
                              name: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      ) : (
                        tech.name
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingTechnician?.id === tech.id ? (
                        <Input
                          type="email"
                          value={editingTechnician.email}
                          onChange={(e) =>
                            setEditingTechnician({
                              ...editingTechnician,
                              email: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      ) : (
                        tech.email
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingTechnician?.id === tech.id ? (
                        <Input
                          type="tel"
                          value={editingTechnician.phone || ""}
                          onChange={(e) =>
                            setEditingTechnician({
                              ...editingTechnician,
                              phone: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      ) : (
                        tech.phone
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingTechnician?.id === tech.id ? (
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateTechnician}
                            disabled={updateTechnicianMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={updateTechnicianMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTechnician(tech)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTechnicianMutation.mutate(tech.id)}
                            disabled={removeTechnicianMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(!technicians || technicians.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No technicians added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
