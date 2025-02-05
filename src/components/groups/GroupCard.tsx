import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Loader2, Users, CheckCircle } from "lucide-react";
import { Group } from "@/types/groups";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  isDeleting?: boolean;
  onSelect: (groupId: string) => void;
  onEdit: (group: Group) => void;
  onRemove: (groupId: string) => void;
}

export const GroupCard = ({
  group,
  isSelected,
  isDeleting,
  onSelect,
  onEdit,
  onRemove,
}: GroupCardProps) => {
  // Fetch technicians count and attendance stats for this group
  const { data: stats } = useQuery({
    queryKey: ['group-stats', group.id],
    queryFn: async () => {
      // Get technicians count
      const { count: techCount } = await supabase
        .from('technicians')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      // Get attendance stats for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('status, technician_id')
        .gte('date', thirtyDaysAgo.toISOString())
        .in('technician_id', 
          supabase
            .from('technicians')
            .select('id')
            .eq('group_id', group.id)
        );

      const totalRecords = attendanceData?.length || 0;
      const presentRecords = attendanceData?.filter(record => record.status === 'present').length || 0;
      const attendanceRate = totalRecords ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0';

      return {
        techniciansCount: techCount || 0,
        attendanceRate: attendanceRate,
      };
    },
  });

  return (
    <Card 
      className={`group relative cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(group.id)}
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(group);
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-red-500"
              onClick={(e) => e.stopPropagation()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{group.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onRemove(group.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        {group.description && (
          <CardDescription>{group.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {stats?.techniciansCount || 0} Technicians
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {stats?.attendanceRate || 0}% Attendance
            </span>
          </div>
        </div>
        <Button 
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Select Group'}
        </Button>
      </CardContent>
    </Card>
  );
};