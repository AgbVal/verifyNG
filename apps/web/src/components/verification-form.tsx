'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function VerificationForm() {
  const router = useRouter();

  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedToken = token.trim();

    if (!normalizedToken) {
      setError('Enter a verification code.');
      return;
    }

    setError('');

    router.push(`/v/${encodeURIComponent(normalizedToken)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="verification-code"
        className="mb-2 block text-[14px] font-medium text-[#344054]"
      >
        Verification code
      </label>

      <div className="flex max-w-[640px] flex-col sm:flex-row">
        <input
          id="verification-code"
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Enter product verification code"
          autoComplete="off"
          className="h-[52px] min-w-0 flex-1 border border-[#aeb9c9] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#98a2b3] focus:border-[#071d49] focus:ring-1 focus:ring-[#071d49] sm:rounded-l-md"
        />

        <button
          type="submit"
          className="h-[52px] shrink-0 bg-[#071d49] px-7 text-[14px] font-semibold text-white transition hover:bg-[#102f64] sm:rounded-r-md"
        >
          Verify product
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-[#b42318]">
          {error}
        </p>
      )}
    </form>
  );
}
