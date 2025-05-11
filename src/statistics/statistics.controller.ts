import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe';
import { movieIdValidation, MovieId } from 'src/movies/validation/movie-id.schema';
import { SetRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get global statistics about the cinema' })
  @SetRoles(Roles.admin)
  getGlobalStatistics() {
    return this.statisticsService.getGlobalStatistics();
  }

  @Get('movies/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific movie' })
  @ApiParam({ name: 'id', description: 'Movie ID', type: Number })
  @SetRoles(Roles.admin)
  @UsePipes(new JoiValidationPipe(movieIdValidation))
  getMovieStatistics(@Param() params: MovieId) {
    return this.statisticsService.getMovieStatistics(params.id);
  }

  @Get('time-range')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific time range' })
  @ApiQuery({ name: 'startDate', description: 'Start date in ISO format', type: String })
  @ApiQuery({ name: 'endDate', description: 'End date in ISO format', type: String })
  @SetRoles(Roles.admin)
  getTimeRangeStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.statisticsService.getTimeRangeStatistics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user-related statistics' })
  @SetRoles(Roles.admin)
  getUserStatistics() {
    return this.statisticsService.getUserStatistics();
  }
}