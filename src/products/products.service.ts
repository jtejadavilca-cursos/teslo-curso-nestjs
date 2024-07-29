import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {


    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
    } catch (error) {

      this.handleDBExceptions(error);
    }

  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if(isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      queryBuilder.where('product.slug = :term', { term });
      queryBuilder.orWhere('product.title = :term', { term });
      product = await queryBuilder.getOne();
      
    }

    if(!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    
    try {
  
      await this.productRepository.save(product);
  
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {

    await this.findOne(id);
    const prod = await this.productRepository.delete(id);

    return prod;
  }


  private handleDBExceptions(error: any) {
    if(error.code === '23505') {
      this.logger.warn('Product already exists');
      throw new BadRequestException('Product already exists');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Something went wrong');
  }
}
