import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    private readonly configService: ConfigService
) {
    super({
        secretOrKey: configService.get('JWT_SECRET'),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.authService.getUserById(id);

    if(!user) {
        throw new UnauthorizedException('Token not valid');
    }

    if(!user.isActive) {
        throw new UnauthorizedException('User is not active');
    }

    //return { userId: payload.sub, username: payload.username };
    return user;
  }
}