import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationDto {


  @ApiProperty({
    example: 10,
    description: 'The number of items to return (Min value: 1).',
    default: 10,
    required: false,
  }) 
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    example: 0,
    description: 'The number of items to skip before starting to collect the result set (Min value: 0).',
    default: 0,
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}