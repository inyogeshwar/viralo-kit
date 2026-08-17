import { MobileBottomNav, Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { workspace } = await getDashboardContext();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar workspaceName={workspace.name} />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
