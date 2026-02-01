// import Link from "next/link";
// import LogoutButton from "@/ui/components/LogoutButton";

// export const metadata = { title: "Admin" };

// export default function AdminLayout({ children }) {
//   return (
//     <div className="min-h-screen bg-zinc-50">
//       <div className="border-b bg-white">
//         <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Link href="/admin" className="font-semibold">
//               Admin
//             </Link>
//             <nav className="text-sm text-zinc-600 flex gap-3">
//               <Link className="hover:text-zinc-900" href="/admin/products">
//                 Products
//               </Link>
//               <Link className="hover:text-zinc-900" href="/admin/categories">
//                 Categories
//               </Link>
//               <Link className="hover:text-zinc-900" href="/pos">
//                 POS
//               </Link>
//             </nav>
//           </div>
//           <LogoutButton />
//         </div>
//       </div>

//       <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
//     </div>
//   );
// }
// app/admin/products/layout.jsx
import AdminNavbar from "@/ui/components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Pembungkus Konten dengan Batas Lebar (Max-Width) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
           {children}
        </div>
      </main>
    </div>
  );
}