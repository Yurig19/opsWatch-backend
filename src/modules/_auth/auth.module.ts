import { JwtStrategy } from '@/core/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisma.service';
import { UserModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthLoginHandler } from './use-cases/commands/auth-login.query';
import { AuthRegisterHandler } from './use-cases/commands/auth-register.handle';

const handlers = [AuthLoginHandler, AuthRegisterHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot(),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, ...handlers],
  exports: [AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
