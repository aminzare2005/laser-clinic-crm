import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { UserFormDialog } from "./_components/UserFormDialog";
import { ToggleUserButton } from "./_components/ToggleUserButton";
import { EditUserDialog } from "./_components/EditUserDialog";
import { DeleteUserButton } from "./_components/DeleteUserButton";

export default async function UsersPage() {
  const session = await requireRole("MANAGER");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const roleBadgeMap = {
    MANAGER: { label: "مدیر کلینیک", variant: "brand" as const },
    SECRETARY: { label: "منشی پذیرش", variant: "default" as const },
    OPERATOR: { label: "اپراتور درمان", variant: "success" as const },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">مدیریت پرسنل و کاربران</h1>
          <p className="text-xs text-muted-foreground mt-1">
            تعریف دسترسی، ویرایش و مدیریت پرسنل پذیرش و درمانگاه
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <UserFormDialog />
        </div>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          {/* نمای کارتی مخصوص موبایل */}
          <div className="sm:hidden divide-y divide-border/60 p-2 space-y-2">
            {users.map((u) => {
              const roleInfo = roleBadgeMap[u.role];
              const isSelf = u.id === session.id;

              return (
                <div key={u.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-border/70 space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-foreground">{u.displayName}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-0.5" dir="ltr">
                        @{u.username}
                      </div>
                    </div>
                    <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <div>
                      {u.isActive ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          حساب فعال
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-slate-400" />
                          غیرفعال
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <EditUserDialog user={u} />
                      {!isSelf && <ToggleUserButton id={u.id} isActive={u.isActive} />}
                      {!isSelf && <DeleteUserButton id={u.id} displayName={u.displayName} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* نمای جدولی مخصوص دسکتاپ و تبلت */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام و نام خانوادگی</TableHead>
                  <TableHead>نام کاربری</TableHead>
                  <TableHead>نقش کاربری</TableHead>
                  <TableHead>وضعیت حساب</TableHead>
                  <TableHead className="text-center">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const roleInfo = roleBadgeMap[u.role];
                  const isSelf = u.id === session.id;

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-foreground">{u.displayName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono" dir="ltr">
                        {u.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge variant="success">فعال</Badge>
                        ) : (
                          <Badge variant="secondary">غیرفعال</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5">
                          <EditUserDialog user={u} />
                          {!isSelf && <ToggleUserButton id={u.id} isActive={u.isActive} />}
                          {!isSelf && <DeleteUserButton id={u.id} displayName={u.displayName} />}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
