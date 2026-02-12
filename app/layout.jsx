import "./globals.css";

export const metadata = {
  title: "POS App",
  icons: {
    icon: "/logopos.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
