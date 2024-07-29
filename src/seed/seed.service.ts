import { Injectable } from '@nestjs/common';
import { initialData } from './interface/seed-product.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {

  constructor(
    private productService : ProductsService,
  ) {}

  async executeSeed(forceInsert = false) {
    console.log('Executing seed');
    const existsData = await this.existsData();
    if(existsData && !forceInsert) {
      return {message: 'Data already exists', status: false, rowAffected: 0};
    }

    if(forceInsert) {
      await this.productService.deleteAll();
    }

    const promisses:Promise<any>[] = [];

    const totalData = [];
    
    const {products} = initialData;
    const length = products.length;
    for (let offset = 0; offset < length; offset += 10) {
      const subSetProducts = products.slice(offset, offset + 10);
      
      subSetProducts.forEach( async (product) => {
        promisses.push( this.productService.create(product));
      });
      totalData.push(subSetProducts);
    }

    Promise.all(promisses).then(() => {
      console.log('Data inserted');
    });

    return totalData;
  }

  private async existsData() {
    const data = await this.productService.findAll({limit: 1, offset: 0});
    return data.length > 0;
  }
}
