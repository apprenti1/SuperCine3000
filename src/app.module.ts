import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TokensModule } from './tokens/tokens.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { RoomsModule } from './rooms/rooms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Token } from './tokens/token.entity';
import { Room } from './rooms/entities/room.entity';
import { MoneyTransaction } from './transactions/transaction.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Movie } from './movies/movie.entity';
import { MoviesModule } from './movies/movies.module';
import { Screening } from './screenings/screening.entity';
import { ScreeningsModule } from './screenings/screening.module';
import { Ticket } from './tickets/ticket.entity';
import { TicketsModule } from './tickets/tickets.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { StatisticsModule } from './statistics/statistics.module';


@Module({
  imports: [
    PrometheusModule.register(),
    UsersModule,
    AuthModule,
    TokensModule,
    RoomsModule,
    TransactionsModule,
    MoviesModule,
    ScreeningsModule,
    TicketsModule,
    StatisticsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      entities: [User, Token, Room, MoneyTransaction, Movie, Screening, Ticket]
    })
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, 
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}
