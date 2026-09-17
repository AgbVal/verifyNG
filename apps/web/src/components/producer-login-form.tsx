'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

interface LoginResponse {
  accessToken: string;
}

export function ProducerLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        getApiUrl('/auth/login'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setError('Invalid email or password.');
          return;
        }

        throw new Error('Login request failed');
      }

      const data = (await response.json()) as LoginResponse;

      sessionStorage.setItem(
        'verifyng_access_token',
        data.accessToken,
      );

      router.push('/producer');
    } catch {
      setError(
        'We could not sign you in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t-2 border-[#071d49] pt-8"
    >
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
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          className="h-[50px] w-full border border-[#d0d5dd] px-4 outline-none transition focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          autoComplete="current-password"
          className="h-[50px] w-full border border-[#d0d5dd] px-4 outline-none transition focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-[#b42318]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-[50px] w-full bg-[#071d49] px-5 text-sm font-semibold text-white transition hover:bg-[#102f64] disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
