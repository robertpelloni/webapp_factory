import "./globals.css";

export const metadata = {
  title: "Autonomous Utility Factory Dashboard",
  description: "Real-time pipeline monitoring, discovery backlog, and dynamic multi-tenant subdomain routes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">{children}</body>
    </html>
  );
}
