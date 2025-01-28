import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Technician } from "@/types/attendance";

const Admin = () => {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    
    const technician: Technician = {
      id: Date.now().toString(),
      ...newTechnician,
      supervisorId: "mock-supervisor-id",
      createdAt: new Date(),
    };

    setTechnicians([...technicians, technician]);
    setNewTechnician({ name: "", email: "", phone: "" });
    
    toast({
      title: "Technician added",
      description: `${technician.name} has been added successfully.`,
    });
  };

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
            <Button type="submit">Add Technician</Button>
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
                {technicians.map((tech) => (
                  <tr key={tech.id} className="border-b">
                    <td className="py-3 px-4">{tech.name}</td>
                    <td className="py-3 px-4">{tech.email}</td>
                    <td className="py-3 px-4">{tech.phone}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTechnicians(
                            technicians.filter((t) => t.id !== tech.id)
                          );
                          toast({
                            title: "Technician removed",
                            description: `${tech.name} has been removed successfully.`,
                          });
                        }}
                        className="text-danger hover:text-danger/80"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {technicians.length === 0 && (
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