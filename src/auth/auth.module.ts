import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AccessTokensModule } from 'src/access-tokens/access-tokens.module';

@Module({
  imports: [
    UsersModule,
    AccessTokensModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
