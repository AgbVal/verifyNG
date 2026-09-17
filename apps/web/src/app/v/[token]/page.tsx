import { redirect } from 'next/navigation';

interface VerificationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function VerificationPage({
  params,
}: VerificationPageProps) {
  const { token } = await params;

  redirect(
    `/?verify=${encodeURIComponent(token)}`,
  );
}
