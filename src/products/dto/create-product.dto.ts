import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: 125.99,
        description: 'Product price',
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: 'Here goes the product description',
        description: 'Product description',
        default: null,
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug for SEO',
        uniqueItems: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        example: 0,
        description: 'Product stock',
        default: 0,
        required: false,
    })
    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @ApiProperty({
        example: ['S', 'M', 'L', 'XL'],
        description: 'Product sizes',
    })
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({
        example: 'men|women|kid|unisex',
        description: 'This indicates who the product is intended for.',
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        example: ['t-shirt', 'clothes', 'teslo'],
        description: 'Product tags',
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty({
        example: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
        description: 'Product images',
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images: string[];
}
