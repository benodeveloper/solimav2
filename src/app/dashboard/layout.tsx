import Sidebar from '@/src/components/dashboard/Sidebar';
import Header from '@/src/components/dashboard/Header';
import { getSession } from '@/src/lib/auth-utils';
import { redirect } from 'next/navigation';

/**
 * Layout for the dashboard section.
 * Author: benodeveloper
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ paddingLeft: 'var(--sidebar-width, 260px)' }}
      >
        <Header userName={session.user.name} userEmail={session.user.email} />
        <main className="p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
