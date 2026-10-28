"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, User, Eye, EyeOff, HeartPulse } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/70 text-slate-900 selection:bg-primary/20">
      <div className="w-full max-w-md space-y-6">
        {/* برند و عنوان سامانه */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-primary to-sky-600 text-white shadow-md mb-2">
            <HeartPulse className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            کلینیک تخصصی پوست، لیزر و زیبایی
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            سامانه یکپارچه مدیریت مراجعین، پرونده و امور مالی
          </p>
        </div>

        {/* کارت ورود VibeFarsi */}
        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-base font-bold text-slate-900">ورود به پنل درمانگاه</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              نام کاربری و رمز عبور اختصاصی خود را وارد نمایید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {state.error}
                </div>
              )}

              <Field label="نام کاربری" htmlFor="username">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="مثال: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="ltr"
                  required
                  startAddon={<User className="size-4 text-slate-400" />}
                />
              </Field>

              <Field label="رمز عبور" htmlFor="password">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    required
                    startAddon={<Lock className="size-4 text-slate-400" />}
                    endAddon={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPassword ? "پنهان‌سازی رمز" : "نمایش رمز"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    }
                  />
                </div>
              </Field>

              <Button
                type="submit"
                className="w-full mt-2 h-11 text-sm font-bold shadow-xs cursor-pointer"
                size="lg"
                disabled={isPending}
              >
                {isPending ? "در حال اعتبارسنجی..." : "ورود به سامانه"}
              </Button>
            </form>

            {/* راهنمای حساب‌های کاربری دمو و انتخاب سریع */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2.5">
              <p className="font-bold text-slate-800 text-[11px]">انتخاب سریع حساب‌های کاربری دمو:</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin", "admin1234")}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer text-start group"
                >
                  <span className="block font-bold text-slate-800 group-hover:text-primary">مدیر</span>
                  <span className="text-[10px] block font-mono text-slate-500 mt-0.5">admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("secretary1", "clinic1234")}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer text-start group"
                >
                  <span className="block font-bold text-slate-800 group-hover:text-primary">منشی</span>
                  <span className="text-[10px] block font-mono text-slate-500 mt-0.5">secretary1</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("operator1", "clinic1234")}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer text-start group"
                >
                  <span className="block font-bold text-slate-800 group-hover:text-primary">اپراتور</span>
                  <span className="text-[10px] block font-mono text-slate-500 mt-0.5">operator1</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
