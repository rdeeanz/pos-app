import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import PosNavbar from "@/ui/components/PosNavbar";

export default async function PosLayout({ children }) {
  const user = await getAuthUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "CASHIER" && user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PosNavbar user={user} />
      <main>{children}</main>
    </div>
  );
}