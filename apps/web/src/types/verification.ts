export type VerificationStatus =
  | 'VERIFIED'
  | 'PREVIOUSLY_VERIFIED'
  | 'UNKNOWN'
  | 'SUSPICIOUS';

export interface VerificationResult {
  status: VerificationStatus;
  message: string;

  product?: {
    name: string;
    brand: string;
    category: string | null;
    size: string | null;
    nafdacNumber: string | null;
  };

  producer?: {
    companyName: string;
  };

  batch?: {
    batchNumber: string;
    manufacturedAt: string;
    expiresAt: string;
  };

  scan?: {
    scanCount: number;
    firstScannedAt: string | null;
  };
}
