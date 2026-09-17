import {
  IsDateString,
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @MaxLength(100)
  batchNumber!: string;

  @IsDateString()
  manufacturedAt!: string;

  @IsDateString()
  expiresAt!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
