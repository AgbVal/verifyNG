'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getApiUrl } from '@/lib/api';

interface ProducerProfile {
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    platformRole: string | null;
    createdAt: string;
  };
  producer: {
    id: string;
    companyName: string;
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
    cacNumber: string | null;
  } | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string | null;
  size: string | null;
  status: string;
  createdAt: string;
}

export default function ProducerPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProducerProfile | null>(
    null,
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(
      'verifyng_producer_access_token',
    );

    if (!token) {
      router.replace('/producer/sign-in');
      return;
    }

    async function loadDashboard() {
      try {
        const profileResponse = await fetch(
          getApiUrl('/auth/me'),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        );

        if (profileResponse.status === 401) {
          sessionStorage.removeItem(
            'verifyng_producer_access_token',
          );
          router.replace('/producer/sign-in');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error('Unable to load producer account.');
        }

        const profileData =
          (await profileResponse.json()) as ProducerProfile;

        if (
          profileData.accountType !== 'PRODUCER' ||
          !profileData.producer
        ) {
          sessionStorage.removeItem(
            'verifyng_producer_access_token',
          );
          router.replace('/producer/sign-in');
          return;
        }

        setProfile(profileData);

        if (profileData.producer.status === 'APPROVED') {
          const productsResponse = await fetch(
            getApiUrl('/products'),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            },
          );

          if (!productsResponse.ok) {
            throw new Error('Unable to load products.');
          }

          const productsData =
            (await productsResponse.json()) as Product[];

          setProducts(productsData);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load producer dashboard.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [router]);

  function handleSignOut() {
    sessionStorage.removeItem(
      'verifyng_producer_access_token',
    );

    router.replace('/producer/sign-in');
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-[#667085]">
        <div className="mx-auto max-w-[1180px]">
          Loading producer dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <header className="border-b border-[#e4e7ec]">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6">
          <Link
            href="/producer"
            className="text-[23px] font-semibold tracking-[-0.045em] text-[#071d49]"
          >
            VerifyNG
          </Link>

          <div className="flex items-center gap-6">
            <span className="hidden text-[13px] font-semibold uppercase tracking-[0.12em] text-[#667085] sm:block">
              Producer Portal
            </span>

            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-semibold text-[#344054]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-12">
        {error && (
          <p
            role="alert"
            className="mb-8 border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
          >
            {error}
          </p>
        )}

        {profile?.producer && (
          <>
            <div className="flex flex-col justify-between gap-6 border-b border-[#e4e7ec] pb-10 md:flex-row md:items-end">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  Producer Dashboard
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#07152f]">
                  {profile.producer.companyName}
                </h1>

                <p className="mt-3 text-sm text-[#667085]">
                  Signed in as {profile.user.name} ·{' '}
                  {profile.role}
                </p>
              </div>

              <StatusBadge status={profile.producer.status} />
            </div>

            {profile.producer.status !== 'APPROVED' ? (
              <section className="mt-12 max-w-[680px] border-t-2 border-[#071d49] pt-6">
                <h2 className="text-xl font-semibold text-[#07152f]">
                  Producer access is limited
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  Your producer account must be approved before
                  products, batches and verification codes can be
                  managed.
                </p>
              </section>
            ) : (
              <>
                <section className="mt-10 grid gap-px border border-[#e4e7ec] bg-[#e4e7ec] sm:grid-cols-3">
                  <Metric
                    label="Registered products"
                    value={String(products.length)}
                  />

                  <Metric
                    label="Producer status"
                    value="Approved"
                  />

                  <Metric
                    label="Your role"
                    value={profile.role ?? '—'}
                  />
                </section>

                <section className="mt-12">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                        Products
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#07152f]">
                        Registered products
                      </h2>
                    </div>

                    <Link
                      href="/producer/products"
                      className="text-sm font-semibold text-[#071d49]"
                    >
                      Manage products →
                    </Link>
                  </div>

                  {products.length === 0 ? (
                    <div className="mt-6 border border-[#e4e7ec] p-8">
                      <p className="font-medium">
                        No products registered yet.
                      </p>

                      <p className="mt-2 text-sm text-[#667085]">
                        Add your first product to begin creating
                        production batches and verification codes.
                      </p>

                      <Link
                        href="/producer/products"
                        className="mt-5 inline-flex h-11 items-center bg-[#071d49] px-5 text-sm font-semibold text-white"
                      >
                        Add product
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-6 divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">
                      {products.slice(0, 5).map((product) => (
                        <Link
                          key={product.id}
                          href={`/producer/products/${product.id}`}
                          className="flex items-center justify-between gap-6 py-5"
                        >
                          <div>
                            <p className="font-semibold text-[#101828]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm text-[#667085]">
                              {product.brand}
                              {product.size
                                ? ` · ${product.size}`
                                : ''}
                            </p>
                          </div>

                          <span className="text-sm font-medium text-[#071d49]">
                            View →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#07152f]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className="w-fit border border-[#d0d5dd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#475467]">
      {label}
    </span>
  );
}
