'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getApiUrl } from '@/lib/api';

interface LoginResponse {
  accessToken: string;
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  user: {
    id: string;
    name: string;
    email: string;
    platformRole: string | null;
  };
}

export default function AdminSignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password.');
      }

      const data = (await response.json()) as LoginResponse;

      if (
        data.accountType !== 'PLATFORM_ADMIN' ||
        !data.user.platformRole
      ) {
        throw new Error(
          'This sign-in page is for VerifyNG platform administrators.',
        );
      }

      sessionStorage.setItem(
        'verifyng_admin_access_token',
        data.accessToken,
      );

      router.replace('/admin');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign in.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <header className="border-b border-[#e4e7ec]">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6">
          <Link
            href="/"
            className="text-[23px] font-semibold tracking-[-0.045em] text-[#071d49]"
          >
            VerifyNG
          </Link>

          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
            Platform Administration
          </span>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1180px] items-center px-6 py-16 lg:grid-cols-2">
        <div className="max-w-[480px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
            Restricted Access
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#07152f]">
            Admin sign in
          </h1>

          <p className="mt-4 leading-7 text-[#667085]">
            Access producer reviews and product concern reports.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 max-w-[440px] border-t-2 border-[#071d49] pt-8 lg:mt-0"
        >
          {error && (
            <p
              role="alert"
              className="mb-6 border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
            >
              {error}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[48px] w-full border border-[#d0d5dd] px-4 outline-none focus:border-[#071d49]"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="h-[48px] w-full border border-[#d0d5dd] px-4 outline-none focus:border-[#071d49]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-[48px] w-full bg-[#071d49] text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
