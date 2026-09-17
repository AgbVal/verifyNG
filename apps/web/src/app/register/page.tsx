'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getApiUrl } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        getApiUrl('/auth/consumer/register'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;

        const message = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;

        throw new Error(
          message || 'We could not create your account.',
        );
      }

      router.push('/sign-in?registered=1');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not create your account.',
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

          <span className="text-sm text-[#667085]">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-semibold text-[#071d49]"
            >
              Sign in
            </Link>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-20">
        <div className="max-w-[560px]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-7 bg-[#071d49]" />

            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#52627a]">
              Join VerifyNG
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#07152f] sm:text-5xl">
            Create your account.
          </h1>

          <p className="mt-5 text-[16px] leading-7 text-[#667085]">
            Create a VerifyNG account to access more product
            information, updates and verification insights.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 border-t border-[#e4e7ec] pt-8"
          >
            <div>
              <label
                htmlFor="name"
                className="text-[13px] font-semibold text-[#344054]"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-12 w-full border border-[#d0d5dd] bg-white px-4 text-[15px] outline-none transition focus:border-[#071d49]"
                placeholder="Enter your full name"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold text-[#344054]"
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
                className="mt-2 h-12 w-full border border-[#d0d5dd] bg-white px-4 text-[15px] outline-none transition focus:border-[#071d49]"
                placeholder="you@example.com"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-[#344054]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full border border-[#d0d5dd] bg-white px-4 text-[15px] outline-none transition focus:border-[#071d49]"
                placeholder="At least 12 characters"
              />

              <p className="mt-2 text-[12px] text-[#667085]">
                Use at least 12 characters.
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirm-password"
                className="text-[13px] font-semibold text-[#344054]"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="mt-2 h-12 w-full border border-[#d0d5dd] bg-white px-4 text-[15px] outline-none transition focus:border-[#071d49]"
                placeholder="Enter your password again"
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
              className="mt-7 h-12 w-full bg-[#071d49] px-5 text-[14px] font-semibold text-white transition hover:bg-[#0b2a62] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <p className="mt-5 text-[13px] leading-5 text-[#667085]">
              Product verification remains available without an
              account.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
