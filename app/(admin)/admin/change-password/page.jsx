import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import ChangePasswordPage from "@/ui/pages/admin/ChangePasswordPage";

export default async function Page() {
  const user = await getAuthUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "OWNER") {
    redirect("/admin/products");
  }

  return <ChangePasswordPage />;
}
