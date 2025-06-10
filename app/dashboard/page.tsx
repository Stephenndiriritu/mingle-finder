import { getAuthStatus } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { authenticated } = await getAuthStatus();

  if (!authenticated) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}