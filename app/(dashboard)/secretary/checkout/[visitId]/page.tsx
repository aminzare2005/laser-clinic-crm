import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckoutInvoiceClient } from "./_components/CheckoutInvoiceClient";

export default async function VisitCheckoutPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole("SECRETARY", "MANAGER");
  const { visitId } = await params;

  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      service: true,
      payment: true,
      operator: { select: { displayName: true } },
    },
  });

  if (!visit) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <CheckoutInvoiceClient visit={visit} />
    </div>
  );
}
