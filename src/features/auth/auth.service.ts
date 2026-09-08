import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { UserModel, UserRole } from '../user/core/user.model';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../user/core/user.repository.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const data = UserModel.create({
      ...dto,
    });

    const user = await this.userRepo.create(data);

    return this.generateTokens(user.id, user.role);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user.password) {
      throw new UnauthorizedException(
        'This account was created using Google login. Please sign in with your social account or set a password.',
      );
    }

    const isPasswordValid = await verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'errors.server.invalid_credentials_error',
      );
    }

    return this.generateTokens(user.id, user.role);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload: { sessionId: string } = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.userRepo.findById(payload.sessionId);

      return this.generateTokens(user.id, user.role);
    } catch {
      throw new UnauthorizedException('errors.server.invalid_refresh_token');
    }
  }

  private async generateTokens(
    userId: string,
    role: UserRole,
  ): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, role },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '31d',
      },
    );

    return { accessToken, refreshToken };
  }
}
