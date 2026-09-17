'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { getApiUrl } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string | null;
  size: string | null;
  barcode: string | null;
  nafdacNumber: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
}

interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturedAt: string;
  expiresAt: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface VerificationCode {
  id: string;
  batchId: string;
  token: string;
  status: string;
  firstScannedAt: string | null;
  scanCount: number;
  createdAt: string;
}

interface ProducerProfile {
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
  producer: {
    id: string;
    companyName: string;
    status: string;
  } | null;
}

export default function ProducerProductPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const productId = params.productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [profile, setProfile] = useState<ProducerProfile | null>(
    null,
  );

  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturedAt, setManufacturedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [quantity, setQuantity] = useState('');

  const [showBatchForm, setShowBatchForm] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);
  const [codeQuantity, setCodeQuantity] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<
    VerificationCode[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingBatch, setIsSubmittingBatch] =
    useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(
      'verifyng_producer_access_token',
    );

    if (!token) {
      router.replace('/producer/sign-in');
      return;
    }

    async function loadProduct() {
      try {
        const [profileResponse, productResponse, batchesResponse] =
          await Promise.all([
            fetch(getApiUrl('/auth/me'), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            }),
            fetch(getApiUrl(`/products/${productId}`), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            }),
            fetch(
              getApiUrl(`/products/${productId}/batches`),
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
              },
            ),
          ]);

        if (
          profileResponse.status === 401 ||
          productResponse.status === 401 ||
          batchesResponse.status === 401
        ) {
          sessionStorage.removeItem(
            'verifyng_producer_access_token',
          );
          router.replace('/producer/sign-in');
          return;
        }

        if (!profileResponse.ok) {
          throw new Error('Unable to load producer account.');
        }

        if (!productResponse.ok) {
          throw new Error('Unable to load product.');
        }

        if (!batchesResponse.ok) {
          throw new Error('Unable to load batches.');
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
        setProduct((await productResponse.json()) as Product);
        setBatches((await batchesResponse.json()) as Batch[]);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load product.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId, router]);

  async function handleCreateBatch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = sessionStorage.getItem(
      'verifyng_producer_access_token',
    );

    if (!token) {
      router.replace('/producer/sign-in');
      return;
    }

    setError('');
    setIsSubmittingBatch(true);

    try {
      const response = await fetch(
        getApiUrl(`/products/${productId}/batches`),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchNumber: batchNumber.trim(),
            manufacturedAt,
            expiresAt,
            quantity: Number(quantity),
          }),
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          'verifyng_producer_access_token',
        );
        router.replace('/producer/sign-in');
        return;
      }

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const batch = (await response.json()) as Batch;

      setBatches((current) => [batch, ...current]);
      setBatchNumber('');
      setManufacturedAt('');
      setExpiresAt('');
      setQuantity('');
      setShowBatchForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create batch.',
      );
    } finally {
      setIsSubmittingBatch(false);
    }
  }

  async function handleGenerateCodes(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedBatch) {
      return;
    }

    const token = sessionStorage.getItem(
      'verifyng_producer_access_token',
    );

    if (!token) {
      router.replace('/producer/sign-in');
      return;
    }

    setError('');
    setGeneratedCodes([]);
    setIsGenerating(true);

    try {
      const response = await fetch(
        getApiUrl(
          `/batches/${selectedBatch.id}/verification-codes/generate`,
        ),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: Number(codeQuantity),
          }),
        },
      );

      if (response.status === 401) {
        sessionStorage.removeItem(
          'verifyng_producer_access_token',
        );
        router.replace('/producer/sign-in');
        return;
      }

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const codes =
        (await response.json()) as VerificationCode[];

      setGeneratedCodes(codes);
      setCodeQuantity('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to generate verification codes.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const canManage =
    profile?.role === 'OWNER' || profile?.role === 'ADMIN';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-[#667085]">
        <div className="mx-auto max-w-[1180px]">
          Loading product...
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[#b42318]">
            Product could not be loaded.
          </p>
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

          <Link
            href="/producer/products"
            className="text-sm font-semibold text-[#344054]"
          >
            Products
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <Link
          href="/producer/products"
          className="text-sm font-semibold text-[#667085]"
        >
          ← Products
        </Link>

        <section className="mt-8 border-b border-[#e4e7ec] pb-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                Product
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#07152f]">
                {product.name}
              </h1>

              <p className="mt-3 text-[#667085]">
                {product.brand}
                {product.size ? ` · ${product.size}` : ''}
              </p>
            </div>

            <span className="w-fit border border-[#d0d5dd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#475467]">
              {product.status}
            </span>
          </div>

          <div className="mt-8 grid gap-5 text-sm sm:grid-cols-3">
            <Detail
              label="Category"
              value={product.category || '—'}
            />
            <Detail
              label="Barcode"
              value={product.barcode || '—'}
            />
            <Detail
              label="NAFDAC number"
              value={product.nafdacNumber || '—'}
            />
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
          >
            {error}
          </p>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                Production
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#07152f]">
                Batches
              </h2>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={() =>
                  setShowBatchForm((current) => !current)
                }
                className="h-11 bg-[#071d49] px-5 text-sm font-semibold text-white"
              >
                {showBatchForm ? 'Cancel' : 'Create batch'}
              </button>
            )}
          </div>

          {showBatchForm && canManage && (
            <form
              onSubmit={handleCreateBatch}
              className="mt-8 max-w-[760px] border-t-2 border-[#071d49] pt-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <BatchField
                  label="Batch number"
                  type="text"
                  value={batchNumber}
                  onChange={setBatchNumber}
                />

                <BatchField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                />

                <BatchField
                  label="Manufacturing date"
                  type="date"
                  value={manufacturedAt}
                  onChange={setManufacturedAt}
                />

                <BatchField
                  label="Expiry date"
                  type="date"
                  value={expiresAt}
                  onChange={setExpiresAt}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingBatch}
                className="mt-6 h-11 bg-[#071d49] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmittingBatch
                  ? 'Creating batch...'
                  : 'Create batch'}
              </button>
            </form>
          )}

          <div className="mt-8">
            {batches.length === 0 ? (
              <div className="border border-[#e4e7ec] p-8">
                <p className="font-medium">
                  No production batches yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="grid gap-4 py-5 md:grid-cols-[1fr_140px_180px_140px_auto] md:items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {batch.batchNumber}
                      </p>

                      <p className="mt-1 text-xs text-[#667085]">
                        Expires {formatDate(batch.expiresAt)}
                      </p>
                    </div>

                    <p className="text-sm">
                      {batch.quantity.toLocaleString()} units
                    </p>

                    <p className="text-sm text-[#667085]">
                      Manufactured{' '}
                      {formatDate(batch.manufacturedAt)}
                    </p>

                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475467]">
                      {batch.status}
                    </span>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBatch(batch);
                          setGeneratedCodes([]);
                          setCodeQuantity('');
                        }}
                        className="text-left text-sm font-semibold text-[#071d49]"
                      >
                        Generate codes →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {selectedBatch && canManage && (
          <section className="mt-12 max-w-[760px] border-t-2 border-[#071d49] pt-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                  Verification Codes
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {selectedBatch.batchNumber}
                </h2>

                <p className="mt-2 text-sm text-[#667085]">
                  Generate up to 100 codes per request during
                  this development phase.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedBatch(null);
                  setGeneratedCodes([]);
                }}
                className="text-sm text-[#667085]"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleGenerateCodes}
              className="mt-6 flex max-w-[420px] gap-3"
            >
              <input
                type="number"
                required
                min={1}
                max={100}
                value={codeQuantity}
                onChange={(event) =>
                  setCodeQuantity(event.target.value)
                }
                placeholder="Number of codes"
                className="h-11 min-w-0 flex-1 border border-[#d0d5dd] px-4 outline-none focus:border-[#071d49]"
              />

              <button
                type="submit"
                disabled={isGenerating}
                className="h-11 bg-[#071d49] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </form>

            {generatedCodes.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold">
                  {generatedCodes.length} codes generated
                </p>

                <div className="mt-4 max-h-[320px] overflow-auto border border-[#e4e7ec]">
                  {generatedCodes.map((code) => (
                    <div
                      key={code.id}
                      className="border-b border-[#e4e7ec] px-4 py-3 font-mono text-xs last:border-b-0"
                    >
                      {code.token}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
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
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

function BatchField({
  label,
  type,
  value,
  onChange,
  min,
}: {
  label: string;
  type: 'text' | 'number' | 'date';
  value: string;
  onChange: (value: string) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        required
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] w-full border border-[#d0d5dd] bg-white px-4 outline-none focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
      />
    </div>
  );
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
