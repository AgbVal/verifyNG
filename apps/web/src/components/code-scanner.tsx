'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BrowserQRCodeReader,
  IScannerControls,
} from '@zxing/browser';

interface CodeScannerProps {
  onDetected: (value: string) => void;
  onClose: () => void;
}

export function CodeScanner({
  onDetected,
  onClose,
}: CodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    let active = true;

    async function startScanner() {
      try {
        if (!videoRef.current) {
          return;
        }

        const controls =
          await reader.decodeFromConstraints(
            {
              video: {
                facingMode: {
                  ideal: 'environment',
                },
              },
            },
            videoRef.current,
            (result) => {
              if (!result || !active) {
                return;
              }

              const value = extractVerificationToken(
                result.getText(),
              );

              if (!value) {
                setError(
                  'This QR code does not contain a valid verification code.',
                );
                return;
              }

              active = false;
              controlsRef.current?.stop();

              onDetected(value);
            },
          );

        controlsRef.current = controls;
      }catch (error) {
         console.error('VerifyNG scanner error:', error);

         if (active) {
           setError(
             error instanceof Error
               ? `Camera error: ${error.name} — ${error.message}`
               : 'Camera access could not be started.',
    );
  }
}
    }

    void startScanner();

    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  function handleClose() {
    controlsRef.current?.stop();
    onClose();
  }

  return (
    <div className="mt-5 border border-[#cfd7e3] bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#101828]">
            Scan VerifyNG QR code
          </p>

          <p className="mt-1 text-[12px] text-[#667085]">
            Position the code inside the camera view.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-[13px] font-semibold text-[#071d49]"
        >
          Close
        </button>
      </div>

      <div className="relative mt-4 overflow-hidden bg-[#101828]">
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-[4/3] w-full object-cover"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[15%] border border-white/80"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-[12px] leading-5 text-[#b42318]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function extractVerificationToken(
  scannedValue: string,
): string | null {
  const value = scannedValue.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    const segments = url.pathname
      .split('/')
      .filter(Boolean);

    if (
      segments.length >= 2 &&
      segments[segments.length - 2] === 'v'
    ) {
      return decodeURIComponent(
        segments[segments.length - 1],
      );
    }

    const queryToken =
      url.searchParams.get('verify');

    if (queryToken) {
      return queryToken.trim();
    }

    return null;
  } catch {
    // Allows a raw VerifyNG token to be scanned as well.
    return value;
  }
}
