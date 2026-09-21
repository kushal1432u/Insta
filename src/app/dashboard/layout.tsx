import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin');
  }

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