import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/movies/movie.entity';
import { Screening } from 'src/screenings/screening.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import { User } from 'src/users/user.entity';
import { MoneyTransaction } from 'src/transactions/transaction.entity';
import { Repository, Between } from 'typeorm';
import { TransactionTypes } from 'src/common/enums/transactions-type.enum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Screening)
    private screeningRepository: Repository<Screening>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MoneyTransaction)
    private transactionRepository: Repository<MoneyTransaction>
  ) {}

  async getGlobalStatistics() {
    const totalMovies = await this.movieRepository.count();
    const totalScreenings = await this.screeningRepository.count();
    const totalTickets = await this.ticketRepository.count();
    const totalUsers = await this.userRepository.count();
    
    // Calculate total revenue from tickets
    const ticketTransactions = await this.transactionRepository.find({
      where: { type: TransactionTypes.payment } // Assuming you have a transaction type
    });

    const totalRevenue = ticketTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return {
      totalMovies,
      totalScreenings,
      totalTickets,
      totalUsers,
      totalRevenue,
      averageTicketsPerScreening: totalScreenings > 0 ? totalTickets / totalScreenings : 0
    };
  }

  async getMovieStatistics(movieId: number) {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
      relations: ['screenings']
    });

    if (!movie) {
      return null;
    }

    const screenings = await this.screeningRepository.find({
      where: { movie: { id: movieId } },
      relations: ['tickets']
    });

    const totalScreenings = screenings.length;
    const totalTickets = screenings.reduce((sum, screening) => sum + (screening.tickets?.length || 0), 0);
    
    return {
      movieId: movie.id,
      title: movie.title,
      totalScreenings,
      totalTickets,
      averageTicketsPerScreening: totalScreenings > 0 ? totalTickets / totalScreenings : 0,
      popularity: totalTickets // Simple popularity metric based on tickets sold
    };
  }

  async getTimeRangeStatistics(startDate: Date, endDate: Date) {
    const screenings = await this.screeningRepository.find({
      where: {
        startsAt: Between(startDate, endDate)
      },
      relations: ['tickets', 'movie']
    });

    const ticketsInRange = await this.ticketRepository.find({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const transactionsInRange = await this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const totalRevenue = transactionsInRange.reduce((sum, transaction) => sum + transaction.amount, 0);

    // Group screenings by movie to find most popular
    const movieScreenings = screenings.reduce((acc, screening) => {
      const movieId = screening.movie.id;
      if (!acc[movieId]) {
        acc[movieId] = {
          movieId,
          title: screening.movie.title,
          screenings: 0,
          tickets: 0
        };
      }
      acc[movieId].screenings++;
      acc[movieId].tickets += screening.tickets?.length || 0;
      return acc;
    }, {});

    // Convert to array and sort by tickets to find most popular
    const moviesPopularity = Object.values(movieScreenings)
      .sort((a: MovieStats, b : MovieStats) => b.tickets - a.tickets);

    return {
      period: {
        start: startDate,
        end: endDate
      },
      totalScreenings: screenings.length,
      totalTickets: ticketsInRange.length,
      totalRevenue,
      mostPopularMovies: moviesPopularity.slice(0, 5) // Top 5 most popular
    };
  }

  async getUserStatistics() {
    const totalUsers = await this.userRepository.count();
    const newUsersLastMonth = await this.userRepository.count({
      where: {
        createdAt: Between(
          new Date(new Date().setMonth(new Date().getMonth() - 1)),
          new Date()
        )
      }
    });

    const tickets = await this.ticketRepository.find({
      relations: ['user']
    });

    // Group tickets by user to find most active users
    const userTickets = tickets.reduce((acc, ticket) => {
      const userId = ticket.user?.id;
      if (userId && !acc[userId]) {
        acc[userId] = {
          userId,
          username: ticket.user.username,
          ticketCount: 0
        };
      }
      if (userId) {
        acc[userId].ticketCount++;
      }
      return acc;
    }, {});

    // Convert to array and sort by ticket count
    const activeUsers = Object.values(userTickets)
      .sort((a: UserStats, b: UserStats) => b.ticketCount - a.ticketCount);

    return {
      totalUsers,
      newUsersLastMonth,
      userGrowthRate: totalUsers > 0 ? (newUsersLastMonth / totalUsers) * 100 : 0,
      mostActiveUsers: activeUsers.slice(0, 10) // Top 10 most active users
    };
  }
}

interface MovieStats{
      movieId: number
      title: string
      screeings: number
      tickets: number
}

interface UserStats{
      userId: number
      username: string
      ticketCount: number
}