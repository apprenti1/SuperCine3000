import { forwardRef, Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "./movie.entity";
import { MoviesService } from "./movies.service";
import { ScreeningsModule } from "src/screenings/screening.module";

@Module({
    imports: [TypeOrmModule.forFeature([Movie]), forwardRef(() => ScreeningsModule)],
    controllers: [MoviesController],
    providers: [MoviesService],
    exports: [MoviesService]
})
export class MoviesModule {}