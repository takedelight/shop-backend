import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address format' })
  @ApiProperty()
  email: string;

  @IsString({ message: 'Password is a required field' })
  @ApiProperty()
  password: string;
}
