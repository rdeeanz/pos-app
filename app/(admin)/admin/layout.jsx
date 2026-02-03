import AdminNavbar from "@/ui/components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Pembungkus Konten dengan Batas Lebar (Max-Width) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
