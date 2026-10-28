import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role } = session.user;

  if (role === "MANAGER") {
    redirect("/manager");
  } else if (role === "SECRETARY") {
    redirect("/secretary/patients");
  } else if (role === "OPERATOR") {
    redirect("/operator/queue");
  } else {
    redirect("/login");
  }
}
