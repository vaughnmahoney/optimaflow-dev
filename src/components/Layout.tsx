
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

const LayoutContent = ({ children, header }: LayoutProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50/80 backdrop-blur-sm">
      {/* Fixed header at the top */}
      {header && (
        <div className="w-full z-40 fixed top-0 left-0 right-0 page-header">
          {header}
        </div>
      )}
      <div className="flex flex-1 w-full">
        <AppSidebar />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[4.5rem]' : 'ml-64'}`}>
          <div className="container mx-auto px-6 py-8 main-content">{children}</div>
        </main>
      </div>
    </div>
  );
};

export const Layout = (props: LayoutProps) => {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
};
