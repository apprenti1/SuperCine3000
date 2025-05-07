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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { number, string } from "joi";
import { ListScreeningsParams, listScreeningsValidation } from "src/screenings/validation/list-screenings.schema";
import { Screening } from "src/screenings/screening.entity";
import { ScreeningsService } from "src/screenings/screening.service";

@Controller('movies')
export class MoviesController {
    constructor(
        private readonly moviesService : MoviesService,
        private readonly screeningsService: ScreeningsService
    ) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste tous les films enregistrés en appliquant les filtres donnés en paramètre."})
    @ApiQuery({name: "title", description: "Filtre les films selon leur titre.", example: "Interstellar", type: string, required: false})
    @ApiQuery({name: "director", description: "Filtre les films selon leur réalisateur", example: "Ridley Scott", type: string, required: false})
    @ApiQuery({name: "genre", description: "Filtre les films selon leur genre.", example: "Action", type: string, required: false})
    @ApiQuery({name: "minDuration", description: "Retire du retour les films de durée inférieure à celle donnée.", example: "1h55m", type: string, required: false})
    @ApiQuery({name: "maxDuration", description: "Retire du retour les films de durée supérieure à celle donnée.", example: "2h", type: string, required: false})
    @ApiQuery({name: "duration", description: "Filtre les films selon leur durée.", example: "3h01", type: string, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre de films par page.", minimum: 1})
    @UsePipes(new JoiValidationPipe(listMoviesParamsValidation))
    listMovies(@Query() queryParams : ListMoviesParams & PaginationRequest) : Promise<ListingReturn<Movie>> {
        return this.moviesService.listMovies(queryParams)
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente le film d'ID donné."})
    @ApiParam({name: 'id', description: "ID du film à présenter.", example: 1, type: number})
    @UsePipes(new JoiValidationPipe(movieIdValidation))
    getMovie(@Param() params: MovieId) : Promise<Movie> {
        return this.moviesService.getMovie(params)
    }

    @Get(':id/planning')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente les projections qui auront lieu de la salle d'ID donné en appliquant les paramètres passés dans l'URL."})
    @ApiParam({name: 'id', description: "ID de la salle concernée.", example: 1, type: number})
    @ApiQuery({name: "startsAfter", description: "Les projections listées débutent après cette date au format ISO 8601.", example: "2025-05-06T18:00:00Z", type: string, required: false})
    @ApiQuery({name: "startsBefore", description: "Les projections listées débutent avant cette date au format ISO 8601.", example: "2025-05-07T19:35:00Z", type: string, required: false})
    @ApiQuery({name: "endsAfter", description: "Les projections listées terminent après cette date au format ISO 8601.", example: "2025-10-18T18:46:00Z", type: string, required: false})
    @ApiQuery({name: "endsBefore", description: "Les projections listées terminent avant cette date au format ISO 8601.", example: "2025-11-28T10:04:00Z", type: string, required: false})
    @ApiQuery({name: "roomName", description: "Filtre les projections selon le nom de la salle dans laquelle elles ont lieu.", example: "Salle 01", type: string, required: false})
    @ApiQuery({name: "roomId", description: "Filtre les projections selon l'ID de la salle dans laquelle elles ont lieu.", example: "1", type: number, minimum: 1, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre d'utilisateurs par page.", minimum: 1})
    listRoomScreenings(
        @Param(new JoiValidationPipe(movieIdValidation)) params : MovieId,
        @Query(new JoiValidationPipe(listScreeningsValidation)) queryParams : ListScreeningsParams & PaginationRequest
    ) : Promise<ListingReturn<Screening>> {
        queryParams.movieId = params.id
        queryParams.movieTitle = undefined
        return this.screeningsService.listScreenings(queryParams)
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({summary: "Enregistre un film avec les informations données."})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createMovieValidation))
    addMovie(@Body() body: CreateMovieRequest) : Promise<Movie> {
        return this.moviesService.addMovie(body)
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Modifie le film d'ID donné avec les informations passées dans le body."})
    @ApiParam({name: 'id', description: "ID du film à modifier.", example: 1, type: number})
    @SetRoles(Roles.admin)
    patchMovie(
        @Param(new JoiValidationPipe(movieIdValidation)) params: MovieId,
        @Body(new JoiValidationPipe(patchMovieValidation)) body: PatchMovieRequest
    ) : Promise<Movie> {
        return this.moviesService.patchMovie(params, body)
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Supprime le film d'ID donné."})
    @ApiParam({name: 'id', description: "ID du film à supprimer.", example: 1, type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(movieIdValidation))
    deleteMovie(@Param() params: MovieId) : Promise<DeleteResult> {
        return this.moviesService.deleteMovie(params)
    }

    @Post('seed')
    @ApiOperation({summary: "Ajoute une cinquantaine de films à la base de données."})
    @Public()
    seed() {
        return this.moviesService.seed()
    }
}