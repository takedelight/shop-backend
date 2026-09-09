import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { type Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: unknown): string | null => {
        const request = req as RequestWithCookies;
        if (request && request.cookies) {
          return request.cookies['accessToken'] ?? null;
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return {
      sub: payload.sub,
      role: payload.role,
    };
  }
}
