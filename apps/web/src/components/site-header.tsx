'use client';

import Link from 'next/link';
import { useState } from 'react';

export function SiteHeader() {
  const [isSignedIn] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return Boolean(
      sessionStorage.getItem('verifyng_access_token'),
    );
  });

  return (
    <header className="relative z-10">
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-6">
        <Link
          href="/"
          className="text-[23px] font-semibold tracking-[-0.045em] text-[#071d49]"
        >
          VerifyNG
        </Link>

        <div className="flex items-center gap-7">
          <span className="hidden text-[14px] text-[#667085] sm:block">
            Product Verification
          </span>

          {isSignedIn ? (
            <Link
              href="/account"
              className="text-[14px] font-medium text-[#344054] transition-colors hover:text-[#071d49]"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-[14px] font-medium text-[#344054] transition-colors hover:text-[#071d49]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
