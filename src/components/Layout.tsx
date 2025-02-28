
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/80 backdrop-blur-sm">
        <AppSidebar />
        <main className="flex-1 transition-all duration-300">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
