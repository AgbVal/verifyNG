import { IsIn } from 'class-validator';

export const PRODUCER_REVIEW_STATUSES = [
  'APPROVED',
  'REJECTED',
] as const;

export type ProducerReviewStatus =
  (typeof PRODUCER_REVIEW_STATUSES)[number];

export class UpdateProducerStatusDto {
  @IsIn(PRODUCER_REVIEW_STATUSES)
  status!: ProducerReviewStatus;
}
