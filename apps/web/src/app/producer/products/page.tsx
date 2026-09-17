'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface ProducerProfile {
  accountType: 'CONSUMER' | 'PRODUCER' | 'PLATFORM_ADMIN';
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
  producer: {
    id: string;
    companyName: string;
    status: string;
  } | null;
}

export default function ProducerProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<ProducerProfile | null>(
    null,
  );

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [barcode, setBarcode] = useState('');
  const [nafdacNumber, setNafdacNumber] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem(
      'verifyng_producer_access_token',
    );

    if (!token) {
      router.replace('/producer/sign-in');
      return;
    }

    async function loadPage() {
      try {
        const [profileResponse, productsResponse] =
          await Promise.all([
            fetch(getApiUrl('/auth/me'), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            }),

            fetch(getApiUrl('/products'), {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: 'no-store',
            }),
          ]);

        if (
          profileResponse.status === 401 ||
          productsResponse.status === 401
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

        if (!productsResponse.ok) {
          throw new Error('Unable to load products.');
        }

        const productsData =
          (await productsResponse.json()) as Product[];

        setProfile(profileData);
        setProducts(productsData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load products.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [router]);

  async function handleCreateProduct(
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
    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        ...(category.trim() && {
          category: category.trim(),
        }),
        ...(size.trim() && {
          size: size.trim(),
        }),
        ...(barcode.trim() && {
          barcode: barcode.trim(),
        }),
        ...(nafdacNumber.trim() && {
          nafdacNumber: nafdacNumber.trim(),
        }),
      };

      const response = await fetch(getApiUrl('/products'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        sessionStorage.removeItem(
          'verifyng_producer_access_token',
        );
        router.replace('/producer/sign-in');
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;

        const message = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;

        throw new Error(message || 'Unable to create product.');
      }

      const product = (await response.json()) as Product;

      setProducts((current) => [product, ...current]);

      setName('');
      setBrand('');
      setCategory('');
      setSize('');
      setBarcode('');
      setNafdacNumber('');
      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create product.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canManage =
    profile?.role === 'OWNER' || profile?.role === 'ADMIN';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-[#667085]">
        <div className="mx-auto max-w-[1180px]">
          Loading products...
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
            href="/producer"
            className="text-sm font-semibold text-[#344054]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="flex flex-col justify-between gap-6 border-b border-[#e4e7ec] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
              Producer Portal
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#07152f]">
              Products
            </h1>

            <p className="mt-3 text-sm text-[#667085]">
              Manage products registered under{' '}
              {profile?.producer?.companyName}.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="h-11 bg-[#071d49] px-5 text-sm font-semibold text-white"
            >
              {showForm ? 'Cancel' : 'Add product'}
            </button>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#b42318] pl-3 text-sm text-[#b42318]"
          >
            {error}
          </p>
        )}

        {showForm && canManage && (
          <form
            onSubmit={handleCreateProduct}
            className="mt-8 max-w-[760px] border-t-2 border-[#071d49] pt-7"
          >
            <h2 className="text-xl font-semibold text-[#07152f]">
              Register a product
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Product name"
                value={name}
                onChange={setName}
                required
                maxLength={200}
              />

              <Field
                label="Brand"
                value={brand}
                onChange={setBrand}
                required
                maxLength={200}
              />

              <Field
                label="Category"
                value={category}
                onChange={setCategory}
                maxLength={100}
              />

              <Field
                label="Size"
                value={size}
                onChange={setSize}
                maxLength={100}
              />

              <Field
                label="Barcode"
                value={barcode}
                onChange={setBarcode}
                maxLength={100}
              />

              <Field
                label="NAFDAC number"
                value={nafdacNumber}
                onChange={setNafdacNumber}
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 h-11 bg-[#071d49] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting
                ? 'Creating product...'
                : 'Create product'}
            </button>
          </form>
        )}

        <section className="mt-10">
          {products.length === 0 ? (
            <div className="border border-[#e4e7ec] p-8">
              <p className="font-medium">
                No products registered.
              </p>

              <p className="mt-2 text-sm text-[#667085]">
                Products you register will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e4e7ec] border-y border-[#e4e7ec]">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/producer/products/${product.id}`}
                  className="grid gap-4 py-5 sm:grid-cols-[1fr_180px_120px_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-[#101828]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-[#667085]">
                      {product.brand}
                      {product.size ? ` · ${product.size}` : ''}
                    </p>
                  </div>

                  <p className="text-sm text-[#667085]">
                    {product.category || 'Uncategorised'}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475467]">
                    {product.status}
                  </p>

                  <span className="text-sm font-semibold text-[#071d49]">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="text"
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[48px] w-full border border-[#d0d5dd] bg-white px-4 outline-none focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49]"
      />
    </div>
  );
}
