'use client';

import { FormEvent, useState } from 'react';
import { getApiUrl } from '@/lib/api';

type ReportReason =
  | 'PACKAGING_ISSUE'
  | 'PRODUCT_QUALITY'
  | 'CODE_REUSED'
  | 'DETAILS_MISMATCH'
  | 'OTHER';

interface ReportConcernProps {
  token: string;
}

export function ReportConcern({
  token,
}: ReportConcernProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] =
    useState<ReportReason>('PACKAGING_ISSUE');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        getApiUrl('/reports'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            reason,
            description: description.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Report submission failed');
      }

      setSubmitted(true);
    } catch {
      setError(
        'We could not submit your report. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-8 border-l-2 border-[#071d49] pl-5">
        <p className="font-semibold">
          Report received
        </p>

        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Thank you. Your concern has been submitted for
          review.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-[#667085] transition hover:text-[#071d49]"
      >
        Report a concern
      </button>
    );
  }

  return (
    <div className="mt-8 w-full border-t border-[#e4e7ec] pt-8">
      <div className="max-w-[560px]">
        <h2 className="text-xl font-semibold">
          Report a concern
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Tell us what looks wrong with this product or
          verification code.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="report-reason"
              className="mb-2 block text-sm font-medium"
            >
              What is the concern?
            </label>

            <select
              id="report-reason"
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value as ReportReason,
                )
              }
              className="h-12 w-full border border-[#d0d5dd] bg-white px-3 outline-none focus:border-[#071d49]"
            >
              <option value="PACKAGING_ISSUE">
                Packaging looks unusual
              </option>

              <option value="PRODUCT_QUALITY">
                Product quality concern
              </option>

              <option value="CODE_REUSED">
                Code may have been reused
              </option>

              <option value="DETAILS_MISMATCH">
                Product details do not match
              </option>

              <option value="OTHER">
                Other concern
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="report-description"
              className="mb-2 block text-sm font-medium"
            >
              Additional details
            </label>

            <textarea
              id="report-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              maxLength={1000}
              placeholder="Describe what you noticed..."
              className="w-full resize-none border border-[#d0d5dd] bg-white p-3 outline-none placeholder:text-[#98a2b3] focus:border-[#071d49]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-[#b42318]"
            >
              {error}
            </p>
          )}

          <div className="flex items-center gap-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#071d49] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting
                ? 'Submitting...'
                : 'Submit report'}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-[#667085]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
