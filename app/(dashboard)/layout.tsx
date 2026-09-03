import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh" style={{ background: "hsl(var(--background))" }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
