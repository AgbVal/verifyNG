import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const REPORT_REASONS = [
  'PACKAGING_ISSUE',
  'PRODUCT_QUALITY',
  'CODE_REUSED',
  'DETAILS_MISMATCH',
  'OTHER',
] as const;

export type ReportReason =
  (typeof REPORT_REASONS)[number];

export class CreateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  token?: string;

  @IsIn(REPORT_REASONS)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
