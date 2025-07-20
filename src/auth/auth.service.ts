/* eslint-disable */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../shared/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import IResponse from '../shared/interfaces/IResponse';
import { compare, hash } from 'bcrypt';
import { UserRole } from '../shared/enums/ERole.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<IResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { nationalId: createUserDto.nationalId },
        ],
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this email or national ID already exists',
        );
      }

      // Hash password
      const hashedPassword = await hash(createUserDto.password, 10);

      // Create new user
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        roles: [UserRole.CITIZEN],
      });

      await this.userRepository.save(newUser);

      return {
        message: 'User registered successfully. Please login.',
        status: 201,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<IResponse> {
    try {
      // Validate input
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        select: [
          'id',
          'email',
          'password',
          'roles',
          'nationalId',
          'name',
          'phone',
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Prepare JWT payload
      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
      };

      // Generate token
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
      });

      const { password, ...userWithoutPassword } = user;
      return {
        data: {
          token,
          user: userWithoutPassword,
        },
        status: 200,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async validateUser(payload: any): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['ownedLand'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  //   async initiatePasswordReset(email: string): Promise<{ message: string }> {
  //     const user = await this.userRepository.findOne({ where: { email } });

  //     if (!user) {
  //       return {
  //         message:
  //           'If an account exists with this email, a reset link has been sent',
  //       };
  //     }

  //     return {
  //       message:
  //         'If an account exists with this email, a reset link has been sent',
  //     };
  //   }
}
