import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import ReportsAdminPage from "@/ui/pages/admin/ReportsAdminPage";

export default async function Page() {
    const user = await getAuthUserFromRequest();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "OWNER" && user.role !== "OPS") {
        redirect("/pos");
    }

    return <ReportsAdminPage initialRole={user.role} />;
}
