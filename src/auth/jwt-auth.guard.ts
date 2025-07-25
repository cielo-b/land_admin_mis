import { BadRequestException, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new BadRequestException(
        'You are not authorized to perform this action.',
      );
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action since you are not logged in.',
      );
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new InternalServerErrorException('JWT secret is not defined.');
      }
      const decoded = verify(token, jwtSecret) as any;
      req.user = decoded;
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new InternalServerErrorException('Error while verifying token.');
    }
  }
}
