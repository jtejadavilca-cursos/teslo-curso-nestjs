import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";
import e from 'express';

@Entity('products')
export class Product {

    @ApiProperty({
        example: 'e5f10711-a7b2-4814-8f29-4362e84dba9e',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
    })
    @Column('text',{unique:true})
    title: string;

    @ApiProperty({
        example: 125.99,
        description: 'Product price',
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'Here goes the product description',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product slug for SEO',
        uniqueItems: true,
    })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({
        example: 0,
        description: 'Product stock',
        default: 0,
    })
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L', 'XL'],
        description: 'Product sizes',
    })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'man',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['t-shirt', 'clothes', 'teslo'],
        description: 'Product tags',
    })
    @Column('text', {
        array: true,
        default: [],
    })
    tags: string[];

    @ApiProperty({
        example: [
            'http://localhost:3000/files/product/e5f10711-a7b2-4814-8f29-4362e84dba9e.jpg',
            'http://localhost:3000/files/product/e5f10711-a7b2-4814-8f29-4362e84dba9x.jpg',
        ],
        description: 'Product images',
    })
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { eager: true },
    )
    images?: ProductImage[];

    @ApiProperty({
        example: 'e5f10711-a7b2-4814-8f29-4362e84dba9e',
        description: 'User ID',
    })
    @ManyToOne(
        () => User,
        (user) => user.products,
        { eager:true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        this.sanitizeSlug();
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.sanitizeSlug();
    }

    sanitizeSlug() {
        const slugValue = this.slug ? this.slug : this.title;
        this.slug = slugValue
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/[^\w-]+/g, '');
    }

}