"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Layers,
  Users,
  Calendar,
  UserCheck,
  CreditCard,
  Clock,
  ShieldCheck,
  CalendarDays,
  Activity,
  HeartPulse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { formatJalali } from "@/lib/jalali";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  user: {
    name?: string | null;
    role: "MANAGER" | "SECRETARY" | "OPERATOR";
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // بستن منوی موبایل هنگام تغییر مسیر
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const roleNameMap = {
    MANAGER: "مدیر کلینیک",
    SECRETARY: "منشی پذیرش",
    OPERATOR: "اپراتور درمان",
  };

  const roleBadgeVariant = {
    MANAGER: "brand" as const,
    SECRETARY: "default" as const,
    OPERATOR: "success" as const,
  };

  // ساختار تفکیک‌شده و منظم منوها بر اساس نقش
  const navGroupsByRole: Record<
    "MANAGER" | "SECRETARY" | "OPERATOR",
    Array<{
      title: string;
      dotColor: string;
      items: Array<{
        title: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
      }>;
    }>
  > = {
    MANAGER: [
      {
        title: "مدیریت و نظارت",
        dotColor: "bg-cyan-500",
        items: [
          { title: "داشبورد و آمار کلینیک", href: "/manager", icon: LayoutDashboard },
          { title: "خدمات و تعرفه‌ها", href: "/manager/services", icon: Layers },
          { title: "کاربران و پرسنل", href: "/manager/users", icon: Users },
        ],
      },
      {
        title: "جریان عملیات کلینیک",
        dotColor: "bg-sky-500",
        items: [
          { title: "پذیرش مراجعین", href: "/secretary/patients", icon: UserCheck },
          { title: "صف انتظار و اتاق‌های درمان", href: "/operator/queue", icon: Clock },
          { title: "صندوق و تسویه حساب", href: "/secretary/checkout", icon: CreditCard },
        ],
      },
    ],
    SECRETARY: [
      {
        title: "پذیرش و صندوق",
        dotColor: "bg-sky-500",
        items: [
          { title: "پذیرش و پرونده مراجعین", href: "/secretary/patients", icon: UserCheck },
          { title: "صف انتظار سالن", href: "/operator/queue", icon: Clock },
          { title: "صندوق و تسویه حساب", href: "/secretary/checkout", icon: CreditCard },
        ],
      },
    ],
    OPERATOR: [
      {
        title: "بخش درمان و لیزر",
        dotColor: "bg-emerald-500",
        items: [
          { title: "صف انتظار و اتاق درمان", href: "/operator/queue", icon: Clock },
        ],
      },
    ],
  };

  const currentNavGroups = navGroupsByRole[user.role] || [];

  const isLinkActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // محاسبه عنوان فعال صفحه فعلی
  const allNavItems = currentNavGroups.flatMap((group) => group.items);
  const currentItem = allNavItems.find((item) => isLinkActive(item.href));
  const pageTitle = currentItem?.title || "میز کار کلینیک";

  const renderNavLinks = (onItemClick?: () => void) => (
    <div className="space-y-6">
      {currentNavGroups.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center justify-between">
            <span>{group.title}</span>
            <span className={cn("size-1.5 rounded-full", group.dotColor)} />
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group",
                    active
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform group-hover:scale-110",
                      active ? "text-white" : "text-slate-500"
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col lg:flex-row text-slate-900 antialiased selection:bg-primary/20">
      {/* سایدبار ثابت دسکتاپ (فقط روی صفحه‌های بزرگ) */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-e border-slate-200/80 bg-white h-screen sticky top-0 z-30 p-4 shadow-[1px_0_3px_0_rgba(0,0,0,0.02)]">
        {/* برند و لوگوی کلینیک */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-100">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <HeartPulse className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">
              کلینیک زیبایی و لیزر
            </h2>
            <p className="text-[11px] text-slate-600 font-medium truncate">
              سامانه جامع پذیرش و درمان
            </p>
          </div>
        </div>

        {/* کپسول هویت کاربر لاگین شده */}
        <div className="my-4 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-primary shadow-xs shrink-0">
              {user.name ? user.name[0] : "ک"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user.name || "کاربر سامانه"}
              </div>
            </div>
          </div>
          <Badge variant={roleBadgeVariant[user.role]} className="text-[10px] px-2 py-0.5 shrink-0">
            {roleNameMap[user.role]}
          </Badge>
        </div>

        {/* منوهای ناوبری */}
        <nav className="flex-1 overflow-y-auto py-2 pe-1 space-y-4">
          {renderNavLinks()}
        </nav>

        {/* فوتر سایدبار و دکمه خروج */}
        <div className="pt-3 border-t border-slate-100">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
            >
              <LogOut className="size-4 shrink-0" />
              <span>خروج امن از سیستم</span>
            </button>
          </form>
        </div>
      </aside>

      {/* نوار ناوبری بالای صفحه در موبایل و تبلت (<lg) - هدر تمیز و مینیمال */}
      <header className="sticky top-0 z-40 lg:hidden flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="mobileNavToggleBtn"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منوی ناوبری"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer transition-colors active:scale-95"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            کلینیک زیبایی
          </span>
        </div>

        <div className="size-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-bold text-primary shadow-xs">
          {user.name ? user.name[0] : "ک"}
        </div>
      </header>

      {/* کشوی منوی موبایل VibeFarsi Sheet */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="start"
        title={
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="size-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 leading-tight">کلینیک زیبایی و لیزر</div>
              <div className="text-[10px] text-slate-600 font-normal">منوی دسترسی سریع</div>
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full justify-between pt-2">
          <div className="space-y-4">
            {/* اطلاعات کاربر در موبایل */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{user.name || "کاربر سامانه"}</div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-medium">{roleNameMap[user.role]}</div>
              </div>
            </div>

            {/* لینک‌های ناوبری موبایل */}
            <div className="py-2">
              {renderNavLinks(() => setMobileOpen(false))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 pb-2">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer border border-rose-200/60 transition-colors"
              >
                <LogOut className="size-4" />
                <span>خروج از حساب</span>
              </button>
            </form>
          </div>
        </div>
      </Sheet>

      {/* بخش بدنه محتوا */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* هدر بالای دسکتاپ: تاریخ امروز و وضعیت شیفت */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-sm px-6 py-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium">بخش جاری:</span>
            <span className="font-bold text-slate-800">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
              <CalendarDays className="size-3.5 text-primary" />
              <span>امروز: {formatJalali(new Date(), { weekday: true, year: true })}</span>
            </div>
          </div>
        </div>

        {/* کانتینر اصلی صفحات با پدینگ ریسپانسیو عالی */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
