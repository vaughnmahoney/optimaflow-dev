
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function SidebarProfile() {
  return (
    <div className="px-6 py-4 flex items-center gap-4 group-data-[state=closed]:justify-center group-data-[state=closed]:px-0">
      <Avatar className="h-10 w-10 border-2 border-purple-200 shrink-0">
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback>HF</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 overflow-hidden transition-all duration-300 group-data-[state=closed]:w-0 group-data-[state=closed]:opacity-0">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm font-medium hover:bg-purple-50 hover:text-purple-900"
        >
          <div className="w-4 h-4 flex items-center justify-center shrink-0 mr-2">
            <Edit className="w-full h-full" strokeWidth={1.5} />
          </div>
          <span>Edit Profile</span>
        </Button>
      </div>
    </div>
  );
}
