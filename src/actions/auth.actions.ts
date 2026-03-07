'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthService } from '@/src/services/auth.service';
import { encrypt } from '@/src/lib/auth-utils';

/**
 * Server Actions for Authentication.
 * Author: benodeveloper
 */

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const user = await AuthService.verifyCredentials(email, password);

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  // Create session
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await encrypt({ user, expires });

  // Save session cookie
  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  redirect('/dashboard');
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
  redirect('/login');
}
