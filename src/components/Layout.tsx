
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <AppSidebar />
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
