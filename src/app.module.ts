import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokensModule } from './access-tokens/access-tokens.module';

@Module({
  imports: [UsersModule, AuthModule, AccessTokensModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
