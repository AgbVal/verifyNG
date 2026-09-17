'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getApiUrl } from '@/lib/api';

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    platformRole: string | null;
    createdAt: string;
  };
}

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<CurrentUserResponse['user'] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(
      'verifyng_access_token',
    );

    if (!token) {
      router.replace('/sign-in');
      return;
    }

    async function loadProfile() {
      try {
        const response = await fetch(getApiUrl('/auth/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (response.status === 401) {
          sessionStorage.removeItem('verifyng_access_token');
          router.replace('/sign-in');
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load your account.');
        }

        const data =
          (await response.json()) as CurrentUserResponse;

        setProfile(data.user);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load your account.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  function handleSignOut() {
    sessionStorage.removeItem('verifyng_access_token');
    router.replace('/');
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

          <button
            type="button"
            onClick={handleSignOut}
            className="text-[14px] font-semibold text-[#344054] transition hover:text-[#071d49]"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-16">
        {isLoading && (
          <p className="text-sm text-[#667085]">
            Loading your account...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
          >
            {error}
          </p>
        )}

        {!isLoading && profile && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-7 bg-[#071d49]" />

              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#52627a]">
                Your account
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#07152f] sm:text-5xl">
              Welcome, {profile.name}.
            </h1>

            <p className="mt-4 max-w-[600px] text-[16px] leading-7 text-[#667085]">
              Manage your VerifyNG account and access your
              verification information from one place.
            </p>

            <div className="mt-12 grid max-w-[760px] border-t border-[#d0d5dd] sm:grid-cols-2">
              <AccountField
                label="Name"
                value={profile.name}
              />

              <AccountField
                label="Email"
                value={profile.email}
              />

              <AccountField
                label="Email status"
                value={
                  profile.emailVerified
                    ? 'Verified'
                    : 'Not verified'
                }
              />

              <AccountField
                label="Member since"
                value={formatDate(profile.createdAt)}
              />
            </div>

            <section className="mt-14 max-w-[760px]">
              <div className="border-t-2 border-[#071d49] pt-6">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#07152f]">
                  Verification activity
                </h2>

                <p className="mt-3 max-w-[600px] text-sm leading-6 text-[#667085]">
                  Your saved verification activity will appear
                  here as VerifyNG account features are connected.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-flex h-11 items-center bg-[#071d49] px-5 text-[13px] font-semibold text-white transition hover:bg-[#102f64]"
                >
                  Verify a product
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function AccountField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#e4e7ec] py-5 sm:pr-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </p>

      <p className="mt-2 text-[15px] font-medium text-[#101828]">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
