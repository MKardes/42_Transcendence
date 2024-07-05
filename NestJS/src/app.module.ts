import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { TFAModule } from './auth/TFA/tfa.module';
import { TFAService } from './auth/TFA/tfa.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AvatarController } from './avatar/avatar.controller';
import { AvatarService } from './avatar/avatar.service';
import { AvatarModule } from './avatar/avatar.module';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { GameModeService } from './game/game-mode.service';
import { GameController } from './game/game.controller';

@Module({
  imports: [
  ChatModule,
  AuthModule,
  UserModule,
  PrismaModule,
  TFAModule,
  JwtModule,
  AvatarModule],
  controllers: [AppController, AvatarController, GameController],
  providers: [UserService, ChatGateway, ChatService, GameGateway, GameService, GameModeService, AuthService, PrismaService, TFAService, JwtService, AvatarService],
})
export class AppModule {}
