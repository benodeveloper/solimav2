'use client';

import { useState } from 'react';
import { login } from '@/src/actions/auth.actions';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

/**
 * Login form component.
 * Author: benodeveloper
 */
export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-emerald-600">SOLIMA</h1>
        <p className="text-slate-500 font-medium">Log in to manage your channels</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-md">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest text-center">
              {error}
            </p>
          </div>
        )}

        <Button type="submit" className="w-full py-3" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <div className="text-center pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Internal access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
