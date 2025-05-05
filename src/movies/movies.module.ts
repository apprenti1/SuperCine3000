import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "./movie.entity";
import { MoviesService } from "./movies.service";

@Module({
    imports: [TypeOrmModule.forFeature([Movie])],
    controllers: [MoviesController],
    providers: [MoviesService],
    exports: [MoviesService]
})
export class MoviesModule {}