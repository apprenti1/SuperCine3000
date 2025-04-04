import { Module } from '@nestjs/common';
import { AccessTokensController } from './access-tokens.controller';
import { AccessTokensService } from './access-tokens.service';
import { accessTokensProviders } from './access-tokens.providers';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '360s' }
      })
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
