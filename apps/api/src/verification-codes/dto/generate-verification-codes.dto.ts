import { IsInt, Max, Min } from 'class-validator';

export class GenerateVerificationCodesDto {
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}
