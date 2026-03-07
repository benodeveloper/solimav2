import { redirect } from 'next/navigation';
import { getSession } from '@/src/lib/auth-utils';

/**
 * Root page redirects to dashboard or login.
 * Author: benodeveloper
 */
export default async function RootPage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
