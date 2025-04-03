import { Module } from '@nestjs/common';
import { AccessTokensController } from './access-tokens.controller';
import { AccessTokensService } from './access-tokens.service';
import { accessTokensProviders } from './access-tokens.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/common/constants';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: {expiresIn: '120s'}
    })
  ],
  controllers: [AccessTokensController],
  providers: [
    AccessTokensService,
    ...accessTokensProviders
  ],
  exports: [AccessTokensService]
})
export class AccessTokensModule {}
