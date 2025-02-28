
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export const Layout = ({ children, header }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        {/* Fixed header at the top */}
        {header && (
          <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white shadow-sm">
            {header}
          </div>
        )}
        <div className="flex">
          {/* Sidebar */}
          <AppSidebar />
          {/* Main content - this is the only part that should scroll */}
          <main className="flex-1 pt-[var(--header-height)] ml-[4.5rem] md:ml-64 transition-all duration-300">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
