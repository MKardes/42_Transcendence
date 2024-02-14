import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../jwtconstants';
import { AvatarService } from 'src/avatar/avatar.service';


@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3000s' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, UserService, AvatarService]
})
export class AuthModule {}
