import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ok } from 'assert';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UseRoleGuard } from './guards/use-role/use-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('private')
  @SetMetadata('roles', ['admin'])
  @UseGuards(AuthGuard(), UseRoleGuard)
  getPrivate(
    @GetUser() user,
    @GetUser('email') userEmail,
    @RawHeaders() headers,
  ) {

    return {
      ok: true,
      message: 'This is a private route',
      headers
    };
  }

  @Get('private2')
  @SetMetadata('roles', ['admin', 'user'])
  @UseGuards(AuthGuard(), UseRoleGuard)
  getPrivate2(
  ) {

    return {
      ok: true,
      message: 'This is a private route',
    };
  }

}
