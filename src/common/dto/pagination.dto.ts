import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}