import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScreeningsController } from "./screening.controller";
import { ScreeningsService } from "./screening.service";
import { MoviesModule } from "src/movies/movies.module";
import { RoomsModule } from "src/rooms/rooms.module";
import { Screening } from "./screening.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Screening]), MoviesModule, forwardRef(() => RoomsModule)],
    controllers: [ScreeningsController],
    providers: [ScreeningsService],
    exports: [ScreeningsService]
})
export class ScreeningsModule {}