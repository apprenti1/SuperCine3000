import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { ScreeningsModule } from 'src/screenings/screening.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), forwardRef(() => ScreeningsModule)],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}