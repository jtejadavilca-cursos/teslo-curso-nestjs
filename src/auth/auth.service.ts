import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData } = createUserDto;

      const user = this.usersRepository.create({
        ...userData,
        password: await bcrypt.hash(password, 10),
      });

      await this.usersRepository.save(user);
      delete user.password;

      //return user;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.usersRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password'],
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      if (!bcrypt.compare(password, user.password)) {
        throw new BadRequestException('Invalid credentials');
      }

      //return user;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  getUserById(id: string) {
      return this.usersRepository.findOne({ where: { id } });
  }

  // private getJwtToken(user: User) {
  //   const token = this.jwtService.sign({ email: user.email });
  //   return token;
  // }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('User already exists');
    }
    
    throw new InternalServerErrorException('Please check server logs');
  }

}
