'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getApiUrl } from '@/lib/api';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  user: {
    id: string;
    name: string;
    email: string;
    platformRole: string | null;
  };
  producer: {
    id: string;
    companyName: string;
    status: string;
  } | null;
  role: string | null;
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registered = searchParams.get('registered') === '1';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        const data = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;

        const message = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;

        throw new Error(message || 'Unable to sign in.');
      }

      const data = (await response.json()) as LoginResponse;

      if (data.accountType !== 'CONSUMER') {
        setError(
          'This sign-in page is for VerifyNG consumer accounts.',
        );
        return;
      }

      sessionStorage.setItem(
        'verifyng_access_token',
        data.accessToken,
      );

      router.push('/account');
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

          <span className="text-[14px] text-[#667085]">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#071d49]"
            >
              Sign up
            </Link>
          </span>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1180px] items-center px-6 py-16 lg:grid-cols-2 lg:gap-24">
        <section className="max-w-[520px]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-7 bg-[#071d49]" />

            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#52627a]">
              Your VerifyNG account
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#07152f] sm:text-5xl">
            Sign in to VerifyNG.
          </h1>

          <p className="mt-5 max-w-[480px] text-[16px] leading-7 text-[#667085]">
            Access your account, verification activity,
            reports, product updates and insights from
            VerifyNG.
          </p>
        </section>

        <section className="mt-12 max-w-[440px] lg:mt-0">
          <form
            onSubmit={handleSubmit}
            className="border-t-2 border-[#071d49] pt-8"
          >
            {registered && (
              <p
                role="status"
                className="mb-6 border-l-2 border-[#027a48] pl-3 text-[13px] leading-5 text-[#027a48]"
              >
                Your account has been created. Sign in to continue.
              </p>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-[50px] w-full border border-[#d0d5dd] bg-white px-4 outline-none transition focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-[#071d49]"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="h-[50px] w-full border border-[#d0d5dd] bg-white px-4 outline-none transition focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 border-l-2 border-[#b42318] pl-3 text-[13px] leading-5 text-[#b42318]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 h-[50px] w-full bg-[#071d49] px-5 text-sm font-semibold text-white transition hover:bg-[#102f64] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="mt-6 text-center text-sm text-[#667085]">
              New to VerifyNG?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#071d49]"
              >
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
