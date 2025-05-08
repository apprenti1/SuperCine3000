import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { ScreeningsService } from "./screening.service";
import { Public } from "src/auth/decorators/public.decorator";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { ListScreeningsParams, listScreeningsValidation } from "./validation/list-screenings.schema";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { Screening } from "./screening.entity";
import { ScreeningId, screeningIdValidation } from "./validation/screening-id.schema";
import { number, string } from "joi";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { CreateScreeningRequest, createScreeningValidation } from "./validation/create-screening.schema";
import { UpdateScreeningRequest, updateScreeningValidation } from "./validation/update-screening.schema";
import { DeleteResult } from "typeorm";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

@Controller('screenings')
export class ScreeningsController{
    constructor(
        private readonly screeningsService: ScreeningsService
    ) {}

    @Get()
    @ApiOperation({summary: "Liste toutes les projections enregistrées en appliquant les critères passés en paramètre."})
    @ApiQuery({name: "startsAfter", description: "Les projections listées débutent après cette date au format ISO 8601.", example: "2025-05-06T18:00:00Z", type: string, required: false})
    @ApiQuery({name: "startsBefore", description: "Les projections listées débutent avant cette date au format ISO 8601.", example: "2025-05-07T19:35:00Z", type: string, required: false})
    @ApiQuery({name: "endsAfter", description: "Les projections listées terminent après cette date au format ISO 8601.", example: "2025-10-18T18:46:00Z", type: string, required: false})
    @ApiQuery({name: "endsBefore", description: "Les projections listées terminent avant cette date au format ISO 8601.", example: "2025-11-28T10:04:00Z", type: string, required: false})
    @ApiQuery({name: "roomName", description: "Filtre les projections selon le nom de la salle dans laquelle elles ont lieu.", example: "Salle 01", type: string, required: false})
    @ApiQuery({name: "roomId", description: "Filtre les projections selon l'ID de la salle dans laquelle elles ont lieu.", example: "1", type: number, minimum: 1, required: false})
    @ApiQuery({name: "movieId", description: "Filtre les projections selon l'ID du film qu'elles projettent.", example: 1, type: number, minimum: 1, required: false})
    @ApiQuery({name: "movieTitle", description: "Filtre les projections selon le titre du film qu'elles projettent.", example: 1, type: number, minimum: 1, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre de projections par page.", minimum: 1})
    @UsePipes(new JoiValidationPipe(listScreeningsValidation))
    listScreenings(@Query() queryParams : ListScreeningsParams & PaginationRequest) : Promise<ListingReturn<Screening>> {
        return this.screeningsService.listScreenings(queryParams)
    }

    @Get(':id')
    @ApiOperation({summary: "Présente la projection d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la projection à présenter.", type: number, example: 1})
    @UsePipes(new JoiValidationPipe(screeningIdValidation))
    getScreening(@Param() params : ScreeningId) : Promise<Screening> {
        return this.screeningsService.getScreening(params)
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({summary: "Enregistre une nouvelle projection avec les informations données."})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createScreeningValidation))
    createScreening(@Body() body : CreateScreeningRequest) : Promise<Screening> {
        return this.screeningsService.createScreening(body)
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Modifie une projection d'ID donné avec les informations passées dans la requête."})
    @ApiParam({name: 'id', description: "ID de la projection à modifier.", type: number, example: 1})
    @SetRoles(Roles.admin)
    patchScreening(
        @Param(new JoiValidationPipe(screeningIdValidation)) params : ScreeningId,
        @Body(new JoiValidationPipe(updateScreeningValidation)) body : UpdateScreeningRequest
    ) : Promise<Screening> {
        return this.screeningsService.patchScreening(params, body)
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Supprime la projection d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la projection à supprimer.", type: number, example: 1})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(screeningIdValidation))
    deleteScreening(@Param() params : ScreeningId) : Promise<DeleteResult> {
        return this.screeningsService.deleteScreening(params)
    }

    @Post('seed')
    @ApiOperation({summary: "Nourrit la base de données en projections."})
    @Public()
    seed(){
        return this.screeningsService.seed()
    }
}