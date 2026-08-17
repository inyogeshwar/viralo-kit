import { UserButton } from "@clerk/nextjs";

import { AccountSwitcher } from "@/components/account-switcher";
import { MobileSidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { env } from "@/lib/env";

export function Topbar({ workspaceName }: { workspaceName: string }) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <span className="text-sm font-semibold">{workspaceName}</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle className="hidden md:flex" />
        <AccountSwitcher mockMode={env.mockMode} />
        <UserButton />
      </div>
    </header>
  );
}
