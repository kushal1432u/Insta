import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Left sidebar — 220px fixed */}
      <Sidebar />

      {/* Top navigation bar — fixed, offset by sidebar */}
      <Header />

      {/* Main scrollable content — offset by sidebar (220px) + topbar (56px) */}
      <main
        className="min-h-screen bg-[#F0F2F5]"
        style={{ paddingLeft: '220px', paddingTop: '56px' }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}