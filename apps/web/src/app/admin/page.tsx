'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getApiUrl } from '@/lib/api';

type ProducerStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'SUSPENDED'
  | 'REJECTED';

interface AdminProfile {
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  user: {
    id: string;
    name: string;
    email: string;
    platformRole:
      | 'REVIEWER'
      | 'OPERATIONS_ADMIN'
      | 'SUPER_ADMIN'
      | null;
  };
}

interface Producer {
  id: string;
  companyName: string;
  cacNumber: string | null;
  status: ProducerStatus;
  createdAt: string;
  memberships: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
  }[];
  _count: {
    products: number;
  };
}

interface Report {
  id: string;
  token: string | null;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  verificationCode: {
    id: string;
    token: string;
    batch: {
      batchNumber: string;
      product: {
        name: string;
        brand: string;
        producer: {
          companyName: string;
        };
      };
    };
  } | null;
}

export default function AdminPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(
    null,
  );
  const [producers, setProducers] = useState<Producer[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(
      'verifyng_admin_access_token',
    );

    if (!token) {
      router.replace('/admin/sign-in');
      return;
    }

    async function loadDashboard() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, producersResponse, reportsResponse] =
          await Promise.all([
            fetch(getApiUrl('/auth/me'), {
              headers,
              cache: 'no-store',
            }),
            fetch(getApiUrl('/admin/producers'), {
              headers,
              cache: 'no-store',
            }),
            fetch(getApiUrl('/admin/reports'), {
              headers,
              cache: 'no-store',
            }),
          ]);

        if (
          profileResponse.status === 401 ||
          producersResponse.status === 401 ||
          reportsResponse.status === 401
        ) {
          sessionStorage.removeItem(
            'verifyng_admin_access_token',
          );
          router.replace('/admin/sign-in');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error('Unable to load administrator account.');
        }

        const profileData =
          (await profileResponse.json()) as AdminProfile;

        if (
          profileData.accountType !== 'PLATFORM_ADMIN' ||
          !profileData.user.platformRole
        ) {
          sessionStorage.removeItem(
            'verifyng_admin_access_token',
          );
          router.replace('/admin/sign-in');
          return;
        }

        if (!producersResponse.ok) {
          throw new Error('Unable to load producers.');
        }

        if (!reportsResponse.ok) {
          throw new Error('Unable to load product reports.');
        }

        setProfile(profileData);
        setProducers(
          (await producersResponse.json()) as Producer[],
        );
        setReports((await reportsResponse.json()) as Report[]);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load admin dashboard.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [router]);

  async function reviewProducer(
    producerId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const token = sessionStorage.getItem(
      'verifyng_admin_access_token',
    );

    if (!token) {
      router.replace('/admin/sign-in');
      return;
    }

    setError('');
    setReviewingId(producerId);

    try {
      const response = await fetch(
        getApiUrl(`/admin/producers/${producerId}/status`),
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          'verifyng_admin_access_token',
        );
        router.replace('/admin/sign-in');
        return;
      }

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const updated = (await response.json()) as {
        id: string;
        status: ProducerStatus;
      };

      setProducers((current) =>
        current.map((producer) =>
          producer.id === updated.id
            ? {
                ...producer,
                status: updated.status,
              }
            : producer,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to review producer.',
      );
    } finally {
      setReviewingId(null);
    }
  }

  function signOut() {
    sessionStorage.removeItem('verifyng_admin_access_token');
    router.replace('/admin/sign-in');
  }

  const pendingProducers = producers.filter(
    (producer) => producer.status === 'PENDING',
  );

  const openReports = reports.filter(
    (report) =>
      report.status === 'OPEN' ||
      report.status === 'REVIEWING',
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-[#667085]">
        <div className="mx-auto max-w-[1180px]">
          Loading administration...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <header className="border-b border-[#e4e7ec]">
        <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6">
          <Link
            href="/admin"
            className="text-[23px] font-semibold tracking-[-0.045em] text-[#071d49]"
          >
            VerifyNG
          </Link>

          <div className="flex items-center gap-6">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.1em] text-[#667085] sm:block">
              {profile?.user.platformRole?.replaceAll('_', ' ')}
            </span>

            <button
              type="button"
              onClick={signOut}
              className="text-sm font-semibold text-[#344054]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="border-b border-[#e4e7ec] pb-9">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
            Platform Administration
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#07152f]">
            Admin dashboard
          </h1>

          <p className="mt-3 text-sm text-[#667085]">
            {profile?.user.name}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
          >
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-px border border-[#e4e7ec] bg-[#e4e7ec] sm:grid-cols-3">
          <Metric
            label="Pending producers"
            value={pendingProducers.length}
          />
          <Metric
            label="Open reports"
            value={openReports.length}
          />
          <Metric
            label="Total producers"
            value={producers.length}
          />
        </section>

        <section className="mt-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
            Producer Review
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#07152f]">
            Pending applications
          </h2>

          {pendingProducers.length === 0 ? (
            <div className="mt-6 border border-[#e4e7ec] p-7 text-sm text-[#667085]">
              No producer applications are awaiting review.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">
              {pendingProducers.map((producer) => {
                const owner = producer.memberships[0]?.user;

                return (
                  <div
                    key={producer.id}
                    className="grid gap-5 py-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {producer.companyName}
                      </p>

                      <p className="mt-1 text-sm text-[#667085]">
                        CAC: {producer.cacNumber || 'Not provided'}
                      </p>

                      <p className="mt-1 text-xs text-[#98a2b3]">
                        Applied {formatDate(producer.createdAt)}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p>{owner?.name || 'Owner unavailable'}</p>
                      <p className="mt-1 text-[#667085]">
                        {owner?.email || '—'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={reviewingId === producer.id}
                        onClick={() =>
                          void reviewProducer(
                            producer.id,
                            'REJECTED',
                          )
                        }
                        className="h-10 border border-[#d0d5dd] px-4 text-sm font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={reviewingId === producer.id}
                        onClick={() =>
                          void reviewProducer(
                            producer.id,
                            'APPROVED',
                          )
                        }
                        className="h-10 bg-[#071d49] px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-16 pb-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
            Consumer Reports
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#07152f]">
            Product concerns
          </h2>

          {reports.length === 0 ? (
            <div className="mt-6 border border-[#e4e7ec] p-7 text-sm text-[#667085]">
              No product concerns have been reported.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="border border-[#e4e7ec] p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#475467]">
                        {formatReason(report.reason)}
                      </p>

                      <p className="mt-2 text-sm text-[#667085]">
                        {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <span className="h-fit w-fit border border-[#d0d5dd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
                      {report.status}
                    </span>
                  </div>

                  {report.description && (
                    <p className="mt-5 max-w-[760px] text-sm leading-6">
                      {report.description}
                    </p>
                  )}

                  <div className="mt-5 grid gap-4 border-t border-[#e4e7ec] pt-5 text-sm md:grid-cols-3">
                    <Detail
                      label="Product"
                      value={
                        report.verificationCode
                          ? `${report.verificationCode.batch.product.brand} ${report.verificationCode.batch.product.name}`
                          : 'Unknown product'
                      }
                    />

                    <Detail
                      label="Producer"
                      value={
                        report.verificationCode?.batch.product
                          .producer.companyName || 'Unknown'
                      }
                    />

                    <Detail
                      label="Verification code"
                      value={
                        report.token ||
                        report.verificationCode?.token ||
                        'Not provided'
                      }
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#07152f]">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#667085]">
        {label}
      </p>

      <p className="mt-2 break-all font-medium">{value}</p>
    </div>
  );
}

function formatReason(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) {
    return data.message[0] || 'Request failed.';
  }

  return data?.message || 'Request failed.';
}
