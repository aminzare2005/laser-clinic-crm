import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TreatmentRoomClient } from "./_components/TreatmentRoomClient";

export default async function TreatmentRoomPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole("OPERATOR", "MANAGER");
  const { visitId } = await params;

  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      service: true,
      photos: true,
      operator: { select: { displayName: true } },
    },
  });

  if (!visit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TreatmentRoomClient visit={visit} />
    </div>
  );
}
