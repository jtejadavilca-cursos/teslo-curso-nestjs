import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('products')
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{unique:true})
    title: string;

    @Column('float', { default: 0 })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column('text', { unique: true })
    slug: string;

    @Column('int', { default: 0 })
    stock: number;

    @Column('text', { array: true })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: [],
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { eager: true },
    )
    images?: ProductImage[];

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