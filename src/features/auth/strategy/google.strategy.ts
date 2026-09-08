import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { IGoogleResponse } from 'src/common/types/google.respose';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: IGoogleResponse,
  ) {
    const { id, emails, photos, displayName } = profile;

    if (!emails?.length) {
      throw new BadRequestException(
        'Помилка авторизації через Google: не знайдено електронну адресу користувача.',
      );
    }

    return {
      provider: 'google',
      googleId: id,
      username: displayName,
      email: emails[0].value,
      avatarUrl: photos?.[0]?.value ?? null,
    };
  }
}
