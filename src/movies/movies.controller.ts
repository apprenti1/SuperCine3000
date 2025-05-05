import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { ListMoviesParams, listMoviesParamsValidation } from "./validation/list-movies.schema";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { Movie } from "./movie.entity";
import { MovieId, movieIdValidation } from "./validation/movie-id.schema";
import { CreateMovieRequest, createMovieValidation } from "./validation/create-movie.schema";
import { PatchMovieRequest, patchMovieValidation } from "./validation/update-movie.schema";
import { DeleteResult } from "typeorm";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { Public } from "src/auth/decorators/public.decorator";

@Controller('movies')
export class MoviesController {
    constructor(
        private readonly moviesService : MoviesService
    ) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listMoviesParamsValidation))
    listMovies(@Query() queryParams : ListMoviesParams & PaginationRequest) : Promise<ListingReturn<Movie>> {
        return this.moviesService.listMovies(queryParams)
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(movieIdValidation))
    getMovie(@Param() params: MovieId) : Promise<Movie> {
        return this.moviesService.getMovie(params)
    }

    @Post()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createMovieValidation))
    addMovie(@Body() body: CreateMovieRequest) : Promise<Movie> {
        return this.moviesService.addMovie(body)
    }

    @Patch(':id')
    @SetRoles(Roles.admin)
    patchMovie(
        @Param(new JoiValidationPipe(movieIdValidation)) params: MovieId,
        @Body(new JoiValidationPipe(patchMovieValidation)) body: PatchMovieRequest
    ) : Promise<Movie> {
        return this.moviesService.patchMovie(params, body)
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(movieIdValidation))
    deleteMovie(@Param() params: MovieId) : Promise<DeleteResult> {
        return this.moviesService.deleteMovie(params)
    }

    @Post('seed')
    @Public()
    seed() : Promise<string> {
        return this.moviesService.seed()
    }
}