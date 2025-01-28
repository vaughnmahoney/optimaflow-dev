import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-primary">
              Hyland Attendance
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-primary hover:text-primary/80"
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 pt-24 pb-8">{children}</main>
    </div>
  );
};