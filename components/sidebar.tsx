"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Images,
  Inbox,
  LayoutDashboard,
  Menu,
  PenSquare,
  Settings,
  Users,
  X,
  Zap,
  Bot,
} from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/media", label: "Media", icon: Images },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/automation", label: "Automation", icon: Bot },
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-card px-3 py-4 md:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
        <Zap className="size-5 text-rose-500" />
        ViraloKit
      </Link>
      <NavLinks />
      <div className="mt-auto space-y-4 pt-4">
        <nav className="flex flex-col gap-1 text-xs text-muted-foreground">
          <Link href="/about" className="hover:text-foreground transition-colors px-3 py-1">About</Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors px-3 py-1">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-foreground transition-colors px-3 py-1">Terms of Service</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors px-3 py-1">Contact</Link>
        </nav>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden size-8">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold" onClick={() => setOpen(false)}>
            <Zap className="size-5 text-rose-500" />
            ViraloKit
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="size-8">
            <X className="size-4" />
          </Button>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/compose", label: "Compose", icon: PenSquare },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/media", label: "Media", icon: Images },
    { href: "/analytics", label: "Stats", icon: BarChart3 },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-card/95 px-2 py-1 backdrop-blur md:hidden">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
