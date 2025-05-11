import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/movies/movie.entity';
import { Screening } from 'src/screenings/screening.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import { User } from 'src/users/user.entity';
import { MoneyTransaction } from 'src/transactions/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Screening, Ticket, User, MoneyTransaction])
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService]
})
export class StatisticsModule {}