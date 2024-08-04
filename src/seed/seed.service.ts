import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { initialData } from './interface/seed-product.interface';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class SeedService {

  constructor(
    private productService : ProductsService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async executeSeed(forceInsert = false) {
    console.log('Executing seed');
    const existsData = await this.existsData();
    if(existsData && !forceInsert) {
      return {message: 'Data already exists', status: false, rowAffected: 0};
    }

    if(forceInsert) {
      await this.deleteTables();
    }

    const userInsert = await this.insertNewUsers();
    await this.insertNewProducts(userInsert);
    

    return 'Data inserted';
  }

  private async deleteTables() {
    this.productService.deleteAll();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach( async (userDto: CreateUserDto) => {
      users.push(this.userRepository.create(userDto));
    });

    console.log('>>>>>>>>>>users', users);

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];

  }

  private async insertNewProducts(user: User) {
    const {products} = initialData;

    const promisses:Promise<any>[] = [];
    const length = products.length;
    for (let offset = 0; offset < length; offset += 10) {
      const subSetProducts = products.slice(offset, offset + 10);
      
      subSetProducts.forEach( async (productDto) => {
        promisses.push( this.productService.create(productDto, user));
      });
    }

    await Promise.all(promisses).then(() => {
      console.log('Data inserted');
    });
  }

  private async existsData() {
    const data = await this.productService.findAll({limit: 1, offset: 0});
    return data.length > 0;
  }
}
