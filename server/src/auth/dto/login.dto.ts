import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ minLength: 6, example: 'test1234' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  user: {
    _id: string;
    email: string;
    fullname: string;
  };
}
