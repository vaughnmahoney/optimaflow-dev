
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTechnicianMutations } from "@/hooks/useTechnicianMutations";

export const TechnicianForm = () => {
  const { addTechnicianMutation } = useTechnicianMutations();
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleAddTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnicianMutation.mutate(
      {
        name: newTechnician.name,
        email: newTechnician.email || null,
        phone: newTechnician.phone || null,
      },
      {
        onSuccess: () => {
          setNewTechnician({ name: "", email: "", phone: "" });
        },
      }
    );
  };

  return (
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
              Email (optional)
            </label>
            <Input
              type="email"
              value={newTechnician.email}
              onChange={(e) =>
                setNewTechnician({ ...newTechnician, email: e.target.value })
              }
              className="mt-1"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone (optional)
            </label>
            <Input
              type="tel"
              value={newTechnician.phone}
              onChange={(e) =>
                setNewTechnician({ ...newTechnician, phone: e.target.value })
              }
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
  );
};
