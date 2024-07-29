import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import e from 'express';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {


    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
      });

      await this.productRepository.save(product);

      return {...product, images};
    } catch (error) {

      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: ['images'],
    });

    return products.map( ({images, ...rest}) => ({
      rest,
      images: images.map(image => image.url)
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if(isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      queryBuilder.where('product.slug = :term', { term });
      queryBuilder.orWhere('product.title = :term', { term });
      queryBuilder.leftJoinAndSelect('product.images', 'image');
      product = await queryBuilder.getOne();
      
    }

    if(!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term);
    return {...rest, images: images.map(image => image.url)};
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...rest } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...rest,
    });

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    
    try {
      if(images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      } else {
        product.images = await this.productImageRepository.findBy({ product: { id } });
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      //return product;
      return this.findOnePlain(id); 
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {

    await this.findOne(id);
    const prod = await this.productRepository.delete(id);

    return prod;
  }


  private handleDBExceptions(error: any) {
    console.log('error', error);
    if(error.code === '23505') {
      this.logger.warn('Product already exists');
      throw new BadRequestException('Product already exists');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Something went wrong');
  }
}
