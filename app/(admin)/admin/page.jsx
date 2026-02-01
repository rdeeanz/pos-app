// import LogoutButton from "@/ui/components/LogoutButton";

// export default function AdminPage() {
//   return (
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between border-b p-4">
//         <h1 className="text-lg font-semibold">Admin Dashboard</h1>
//         <LogoutButton />
//       </div>

//       {/* Content */}
//       <div className="p-6">
//         <p>Only ADMIN can access this page.</p>
//       </div>
//     </div>
//   );
// }

import AdminHomePage from "@/ui/pages/admin/AdminHomePage";

export default function Page() {
  return <AdminHomePage />;
}
