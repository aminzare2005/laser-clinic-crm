"use client";

import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import {
  Users,
  Calendar,
  Layers,
  HeartPulse,
  LogOut,
  UserCheck,
  CreditCard,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { Sidebar, SidebarItem, SidebarGroup } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  user: {
    name?: string | null;
    role: "MANAGER" | "SECRETARY" | "OPERATOR";
  };
}

export function AppSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const roleNameMap = {
    MANAGER: "مدیر کلینیک",
    SECRETARY: "منشی پذیرش",
    OPERATOR: "اپراتور درمان",
  };

  const managerItems = [
    { title: "داشبورد و آمار", href: "/manager", icon: LayoutDashboard },
    { title: "خدمات و تعرفه‌ها", href: "/manager/services", icon: Layers },
    { title: "کاربران و پرسنل", href: "/manager/users", icon: Users },
  ];

  const secretaryItems = [
    { title: "پذیرش و پرونده", href: "/secretary/patients", icon: UserCheck },
    { title: "صندوق و تسویه", href: "/secretary/checkout", icon: CreditCard },
  ];

  const operatorItems = [
    { title: "صف انتظار و درمان", href: "/operator/queue", icon: Clock },
  ];

  const header = (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <HeartPulse className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate">کلینیک لیزر و زیبایی</h2>
          <p className="text-[11px] text-muted-foreground truncate">سامانه یکپارچه درمانگاه</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 rounded-control bg-slate-50 border border-border/80">
        <span className="text-xs font-semibold text-slate-800 truncate">
          {user.name || "کاربر سامانه"}
        </span>
        <Badge variant={user.role === "MANAGER" ? "brand" : user.role === "SECRETARY" ? "default" : "success"}>
          {roleNameMap[user.role]}
        </Badge>
      </div>
    </div>
  );

  const footer = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
      >
        <LogOut className="size-4 shrink-0" />
        <span>خروج از حساب</span>
      </button>
    </form>
  );

  return (
    <Sidebar header={header} footer={footer} className="h-screen sticky top-0 shrink-0">
      {user.role === "MANAGER" ? (
        <>
          <SidebarGroup title="مدیریت و نظارت">
            {managerItems.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.title}
                href={item.href}
                icon={item.icon}
                active={pathname === item.href}
              />
            ))}
          </SidebarGroup>
          <SidebarGroup title="عملیات کلینیک">
            <SidebarItem
              label="پذیرش مراجعین"
              href="/secretary/patients"
              icon={UserCheck}
              active={pathname === "/secretary/patients"}
            />
            <SidebarItem
              label="صف انتظار و درمان"
              href="/operator/queue"
              icon={Clock}
              active={pathname.startsWith("/operator/queue")}
            />
            <SidebarItem
              label="صندوق و تسویه"
              href="/secretary/checkout"
              icon={CreditCard}
              active={pathname.startsWith("/secretary/checkout")}
            />
          </SidebarGroup>
        </>
      ) : user.role === "SECRETARY" ? (
        <SidebarGroup title="پذیرش و مالی">
          {secretaryItems.map((item) => (
            <SidebarItem
              key={item.href}
              label={item.title}
              href={item.href}
              icon={item.icon}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
          <SidebarItem
            label="صف انتظار سالن"
            href="/operator/queue"
            icon={Clock}
            active={pathname.startsWith("/operator/queue")}
          />
        </SidebarGroup>
      ) : (
        <SidebarGroup title="اتاق درمان">
          {operatorItems.map((item) => (
            <SidebarItem
              key={item.href}
              label={item.title}
              href={item.href}
              icon={item.icon}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </SidebarGroup>
      )}
    </Sidebar>
  );
}

// Export with original name for backwards compatibility
export { AppSidebar as Sidebar };
