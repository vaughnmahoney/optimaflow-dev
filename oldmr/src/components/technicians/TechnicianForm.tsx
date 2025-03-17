import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTechnicianMutations } from "@/hooks/useTechnicianMutations";
import { GroupSelector } from "@/components/groups/GroupSelector";

export const TechnicianForm = () => {
  const { addTechnicianMutation } = useTechnicianMutations();
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    email: "",
    phone: "",
    group_id: "",
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!newTechnician.group_id) {
      return;
    }

    try {
      await addTechnicianMutation.mutateAsync(
        {
          name: newTechnician.name,
          email: newTechnician.email || null,
          phone: newTechnician.phone || null,
          group_id: newTechnician.group_id,
        },
        {
          onSuccess: () => {
            setNewTechnician({ name: "", email: "", phone: "", group_id: "" });
          },
        }
      );
    } catch (error: any) {
      if (error?.message?.includes("technicians_email_key")) {
        setEmailError("This email is already in use by another technician");
      }
    }
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
              onChange={(e) => {
                setEmailError(null);
                setNewTechnician({ ...newTechnician, email: e.target.value });
              }}
              className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
              placeholder="john@example.com"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Group <span className="text-red-500">*</span>
          </label>
          <GroupSelector
            onGroupSelect={(groupId) =>
              setNewTechnician({ ...newTechnician, group_id: groupId })
            }
            selectedGroupId={newTechnician.group_id}
          />
        </div>
        <Button 
          type="submit"
          disabled={addTechnicianMutation.isPending || !newTechnician.group_id}
        >
          {addTechnicianMutation.isPending ? "Adding..." : "Add Technician"}
        </Button>
      </form>
    </div>
  );
};