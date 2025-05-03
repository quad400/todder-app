import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, LoginUserDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { UserType } from 'src/user/model/user.model';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(body: CreateUserDto) {
    await this.userRepository.checkUnique(body, 'email');
    const { password, ...rest } = body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(body.password, salt);

    const user = await this.userRepository.create({
      ...rest,
      password: hashPassword,
    });
    return user;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findWithPassword(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // async loginUser(body: LoginUserDto) {
  //   const user = await this.userRepository.findWithPassword(body.email);
  //   if (!user) {
  //     throw new BadRequestException('Invalid email and password');
  //   }
  //   const passwordMatch = await bcrypt.compare(body.password, user.password);
  //   if (!passwordMatch) {
  //     throw new BadRequestException('Invalid email and password');
  //   }
  //   const userData = await this.userRepository.findByEmail(user.email);

  //   return {
  //     user: userData,
  //     ...(await this.generateTokens(user)),
  //   };
  // }

  async loginUser(user: any): Promise<AuthResponseDto> {
    const payload = { email: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
      user: {
        _id: user.id,
        email: user.email,
        fullname: user.fullname,
      },
    };
  }

  async googleAuth(body: GoogleAuthDto, accessToken: string) {
    const user = await this.verifyGoogleToken(accessToken, body);
    let exists = await this.userRepository.findByEmail(user.email);
    if (!exists) {
      exists = await this.userRepository.create(user);
    }

    if (!exists) {
      throw new BadRequestException('User creation failed');
    }
    const userData = await this.userRepository.findByEmail(user.email);
    return {
      user: userData,
      ...this.generateTokens(user),
    };
  }

  async verifyGoogleToken(accessToken: string, data: GoogleAuthDto) {
    const profile = await this.getGoogleInfo(accessToken);

    const body = {
      email: profile?.email,
      fullname: profile?.name,
      // avatar: profile?.picture,
      googleId: profile?.sub,
      // role: data.role || UserRole.User,
      // notificationToken: data.notificationToken,
    } as UserType;

    return body;
  }

  async generateTokens(user: UserType) {
    const payload = {
      _id: user._id,
      email: user.email,
      // role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });
    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  async getGoogleInfo(accessToken: string) {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  async getUsers() {
    return await this.userRepository.find({});
  }
}
