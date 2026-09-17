'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { CodeScanner } from '@/components/code-scanner';
import { ReportConcern } from '@/components/report-concern';
import { getApiUrl } from '@/lib/api';
import type { VerificationResult } from '@/types/verification';

export function HomeVerification() {
  const searchParams = useSearchParams();
  const initialVerificationStarted = useRef(false);

  const [token, setToken] = useState('');
  const [result, setResult] =
    useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScannerOpen, setIsScannerOpen] =
    useState(false);

  async function verifyToken(rawToken: string) {
    const normalizedToken = rawToken.trim();

    if (!normalizedToken) {
      setError('Enter a verification code.');
      return;
    }

    setToken(normalizedToken);
    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        getApiUrl(
          `/verify/${encodeURIComponent(normalizedToken)}`,
        ),
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data =
        (await response.json()) as VerificationResult;

      setResult(data);
    } catch {
      setError(
        'We could not complete the verification. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void verifyToken(token);
  }

  function handleScannedCode(value: string) {
    setIsScannerOpen(false);
    setToken(value);

    void verifyToken(value);
}

  useEffect(() => {
    const verificationToken =
      searchParams.get('verify')?.trim();

    if (
      !verificationToken ||
      initialVerificationStarted.current
    ) {
      return;
    }

    initialVerificationStarted.current = true;

    void verifyToken(verificationToken);
  }, [searchParams]);

  return (
    <div className="grid items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
      {/* LEFT */}
      <section>
        <div className="mb-7 flex items-center gap-3">
          <span className="h-px w-7 bg-[#071d49]" />

          <span className="text-[13px] font-semibold tracking-[0.04em] text-[#344054]">
            Verify before you trust
          </span>
        </div>

        <h1 className="max-w-[650px] text-[52px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#071d49] sm:text-[64px] lg:text-[76px]">
          Know what you&apos;re buying.
        </h1>

        <p className="mt-7 max-w-[610px] text-[17px] leading-7 text-[#536179]">
          Check the registered product information associated
          with a VerifyNG code before you use or purchase a
          packaged product.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 max-w-[640px]"
        >
          <label
            htmlFor="verification-code"
            className="mb-2 block text-[14px] font-medium text-[#344054]"
          >
            Verification code
          </label>

          <div className="flex flex-col sm:flex-row">
            <input
              id="verification-code"
              type="text"
              value={token}
              onChange={(event) =>
                setToken(event.target.value)
              }
              placeholder="Enter product verification code"
              autoComplete="off"
              className="h-[52px] min-w-0 flex-1 border border-[#aeb9c9] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#98a2b3] focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49] sm:rounded-l-md"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="h-[52px] shrink-0 bg-[#071d49] px-7 text-[14px] font-semibold text-white transition hover:bg-[#102f64] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-r-md"
            >
              {isLoading
                ? 'Checking...'
                : 'Verify product'}
            </button>
          </div>

         {error && (
	   <p
	    role="alert"
	    className="mt-3 text-[13px] text-[#b42318]"
	  >
	    {error}
	  </p>
	)}

	<div className="mt-4 flex items-center gap-4">
	  <button
	    type="button"
	    onClick={() =>
	      setIsScannerOpen((current) => !current)
	    }
	    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#071d49] transition hover:text-[#102f64]"
	  >
	    <svg
	      width="17"
	      height="17"
	      viewBox="0 0 24 24"
	      fill="none"
	      aria-hidden="true"
	    >
	      <path
	        d="M4 8V5C4 4.45 4.45 4 5 4H8"
	        stroke="currentColor"
	        strokeWidth="1.7"
	        strokeLinecap="round"
	      />

	      <path
	        d="M16 4H19C19.55 4 20 4.45 20 5V8"
	        stroke="currentColor"
	        strokeWidth="1.7"
	        strokeLinecap="round"
	      />

	      <path
	        d="M20 16V19C20 19.55 19.55 20 19 20H16"
	        stroke="currentColor"
	        strokeWidth="1.7"
	        strokeLinecap="round"
	      />

	      <path
	        d="M8 20H5C4.45 20 4 19.55 4 19V16"
	        stroke="currentColor"
	        strokeWidth="1.7"
	        strokeLinecap="round"
	      />

	      <path
	        d="M7 12H17"
	        stroke="currentColor"
	        strokeWidth="1.7"
	        strokeLinecap="round"
	      />
	    </svg>

	    {isScannerOpen
	      ? 'Close scanner'
	      : 'Scan QR code'}
	  </button>

	  <span className="text-[12px] text-[#98a2b3]">
	    or enter the code manually
	  </span>
	</div>

	{isScannerOpen && (
	  <CodeScanner
	    onDetected={handleScannedCode}
	    onClose={() => setIsScannerOpen(false)}
	  />
	)}
     </form>

      <p className="mt-5 text-[13px] text-[#667085]">
         No account required.
       </p>
      </section>

      {/* RIGHT */}
      <VerificationDisplay
        result={result}
        token={token.trim()}
        isLoading={isLoading}
      />
    </div>
  );
}

interface VerificationDisplayProps {
  result: VerificationResult | null;
  token: string;
  isLoading: boolean;
}

function VerificationDisplay({
  result,
  token,
  isLoading,
}: VerificationDisplayProps) {
  const shouldShowOnMobile = result !== null || isLoading;

  return (
    <section
      className={`relative min-h-[420px] items-center justify-center lg:flex lg:min-h-[520px] ${
        shouldShowOnMobile
          ? 'mt-10 flex'
          : 'hidden'
      } lg:mt-0`}
    >
      {/* Decorative circles - desktop only */}
      <div className="pointer-events-none absolute hidden h-[470px] w-[470px] rounded-full border border-[#dce3ed] lg:block" />

      <div className="pointer-events-none absolute hidden h-[350px] w-[350px] rounded-full border border-[#e7ebf1] lg:block" />

      <div className="pointer-events-none absolute hidden h-[230px] w-[230px] rounded-full border border-[#eef1f5] lg:block" />

      {/* Product record card */}
      <div className="relative z-10 w-full max-w-[370px] border border-[#cfd7e3] bg-white shadow-[0_18px_50px_rgba(7,29,73,0.08)]">
        {isLoading ? (
          <LoadingState />
        ) : result ? (
          <ResultState
            result={result}
            token={token}
          />
        ) : (
          <IdleState />
        )}
      </div>

      {/* Decorative microtext - desktop only */}
      <div className="absolute bottom-1 hidden gap-10 text-[10px] font-semibold tracking-[0.2em] text-[#98a2b3] lg:flex">
        <span>VERIFY</span>
        <span>TRACE</span>
        <span>REVIEW</span>
      </div>
    </section>
  );
}

function IdleState() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[#e4e7ec] px-6 py-4">
        <span className="text-[11px] font-semibold tracking-[0.15em] text-[#667085]">
          PRODUCT RECORD
        </span>

        <span className="text-[11px] text-[#98a2b3]">
          VERIFYNG
        </span>
      </div>

      <div className="p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center bg-[#071d49] text-lg font-semibold text-white">
            ✓
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#667085]">
              READY TO VERIFY
            </p>

            <p className="mt-1 text-[15px] font-semibold text-[#101828]">
              Product information
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <RecordPlaceholder label="PRODUCT" />
          <RecordPlaceholder label="PRODUCER" />
          <RecordPlaceholder label="BATCH" />
        </div>
      </div>

      <div className="h-[3px] bg-gradient-to-r from-[#071d49] via-[#45648f] to-[#dbe4f0]" />
    </>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <p className="text-[11px] font-semibold tracking-[0.15em] text-[#667085]">
        VERIFYING PRODUCT
      </p>

      <h2 className="mt-4 text-xl font-semibold text-[#101828]">
        Checking product record...
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#667085]">
        We&apos;re checking the code against registered
        VerifyNG product information.
      </p>
    </div>
  );
}

function ResultState({
  result,
  token,
}: {
  result: VerificationResult;
  token: string;
}) {
  const status = getStatusContent(result.status);

  return (
    <>
      <div className="flex items-center justify-between border-b border-[#e4e7ec] px-6 py-4">
        <span className="text-[11px] font-semibold tracking-[0.15em] text-[#667085]">
          PRODUCT RECORD
        </span>

        <span className="text-[11px] text-[#98a2b3]">
          VERIFYNG
        </span>
      </div>

      <div className="p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#071d49] text-lg font-semibold text-white">
            {status.symbol}
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#667085]">
              {status.label}
            </p>

            <h2 className="mt-1 text-[17px] font-semibold leading-6 text-[#101828]">
              {status.heading}
            </h2>
          </div>
        </div>

        <p className="mt-5 text-[13px] leading-6 text-[#667085]">
          {result.message}
        </p>

        {result.product && (
          <div className="mt-6 space-y-4 border-t border-[#e4e7ec] pt-5">
            <RecordValue
              label="PRODUCT"
              value={result.product.name}
            />

            {result.producer && (
              <RecordValue
                label="PRODUCER"
                value={result.producer.companyName}
              />
            )}

            {result.batch && (
              <RecordValue
                label="BATCH"
                value={result.batch.batchNumber}
              />
            )}

            {result.product.size && (
              <RecordValue
                label="SIZE"
                value={result.product.size}
              />
            )}
          </div>
        )}

        {result.status ===
          'PREVIOUSLY_VERIFIED' &&
          result.scan && (
            <div className="mt-6 border-t border-[#e4e7ec] pt-5">
              <p className="text-[12px] font-semibold text-[#101828]">
                Did you verify this product previously?
              </p>

              <p className="mt-2 text-[12px] leading-5 text-[#667085]">
                If not, check the product and packaging
                carefully before use or purchase.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <RecordValue
                  label="TIMES VERIFIED"
                  value={String(
                    result.scan.scanCount,
                  )}
                />

                <RecordValue
                  label="FIRST VERIFIED"
                  value={formatDate(
                    result.scan.firstScannedAt,
                  )}
                />
              </div>
            </div>
          )}

        {result.status !== 'UNKNOWN' && token && (
          <div className="mt-6 border-t border-[#e4e7ec] pt-5">
            <ReportConcern token={token} />
          </div>
        )}
      </div>

      <div className="h-[3px] bg-gradient-to-r from-[#071d49] via-[#45648f] to-[#dbe4f0]" />
    </>
  );
}

function getStatusContent(
  status: VerificationResult['status'],
) {
  switch (status) {
    case 'VERIFIED':
      return {
        symbol: '✓',
        label: 'VERIFIED',
        heading: 'Product information verified',
      };

    case 'PREVIOUSLY_VERIFIED':
      return {
        symbol: '!',
        label: 'PREVIOUSLY VERIFIED',
        heading:
          'This code has been verified before',
      };

    case 'SUSPICIOUS':
      return {
        symbol: '!',
        label: 'CHECK CAREFULLY',
        heading:
          'Additional verification required',
      };

    case 'UNKNOWN':
      return {
        symbol: '?',
        label: 'UNKNOWN CODE',
        heading: 'Code not recognized',
      };
  }
}

function RecordValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.14em] text-[#98a2b3]">
        {label}
      </p>

      <p className="mt-1 text-[13px] font-medium text-[#344054]">
        {value}
      </p>
    </div>
  );
}

function RecordPlaceholder({
  label,
}: {
  label: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.14em] text-[#98a2b3]">
        {label}
      </p>

      <div className="mt-2 h-[7px] w-2/3 bg-[#eef1f5]" />
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
