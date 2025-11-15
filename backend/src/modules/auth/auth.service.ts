import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Create user
    const user = await this.usersService.create(
      registerDto.email,
      passwordHash,
      registerDto.name,
    );

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      const accessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          email: payload.email,
        },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN'),
        },
      );

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}

