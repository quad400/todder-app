import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user';
import { BusinessCode } from 'src/common/enums/response';
import { Response } from 'src/common/utils/response';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto, LoginUserDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/no-auth.decorator';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() body: CreateUserDto) {
    return new Response(
      true,
      BusinessCode.CREATED,
      'User created successfully',
      await this.authService.createUser(body),
    );
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ type: AuthResponseDto })
  async login(@Body() body: LoginUserDto) {
    return new Response(
      true,
      BusinessCode.OK,
      'User authenticated successfully',
      await this.authService.loginUser(body),
    );
  }

  @Post('/google')
  async googleAuth(@Body() body: GoogleAuthDto, @Req() req: Request) {
    const accessToken =
      req.headers.authorization?.split(' ')[1]! || body.accessToken;
    return new Response(
      true,
      BusinessCode.OK,
      'User Authenticated',
      await this.authService.googleAuth(body, accessToken),
    );
  }
  // @Post('create-user')
  // async createUser(@Body() body: CreateUserDto) {
  //   return new Response(
  //     true,
  //     BusinessCode.CREATED,
  //     'User created successfully',
  //     await this.authService.createUser(body),
  //   );
  // }
}
