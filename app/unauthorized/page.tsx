import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/80">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-surface bg-white border border-slate-200 shadow-sm">
        <div className="size-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">دسترسی غیرمجاز</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          شما مجوز دسترسی به این بخش از سامانه را ندارید. در صورت نیاز با مدیر کلینیک هماهنگ کنید.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="default">بازگشت به سامانه</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
