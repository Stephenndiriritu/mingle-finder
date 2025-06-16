import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Redirect to main app dashboard to avoid route conflicts
  redirect('/app');
}