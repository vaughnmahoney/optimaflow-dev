import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTechnicianDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isMultiple?: boolean;
}

export const DeleteTechnicianDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isMultiple = false,
}: DeleteTechnicianDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {isMultiple
              ? "This action will permanently delete the selected technicians and their attendance records. This action cannot be undone."
              : "This action will permanently delete this technician and their attendance records. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};