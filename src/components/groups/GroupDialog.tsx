import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupForm } from "./GroupForm";
import { Group } from "@/types/groups";

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialData?: Group;
  onSuccess: (group?: Group) => void;
}

export const GroupDialog = ({
  open,
  onOpenChange,
  title,
  initialData,
  onSuccess,
}: GroupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <GroupForm 
          initialData={initialData}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};