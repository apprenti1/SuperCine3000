import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UsePipes } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateRoomRequest, createRoomValidation } from "./validation/create-room.schema";
import { ExistingRoomPipe, UniqueRoomPipe } from "./validation/pipes/RoomExistencePipe";
import { RoomId, roomIdValidation } from "./validation/room-id.schema";
import { UpdateRoomRequest, updateRoomValidation } from "./validation/update-room.schema";
import { ListRoomsParam, listRoomsValidation } from "./validation/list-rooms.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { Public } from "src/auth/decorators/public.decorator";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { Request } from "express";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { Room } from "./entities/room.entity";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { boolean, number, string } from "joi";
import { ScreeningsService } from "src/screenings/screening.service";
import { Screening } from "src/screenings/screening.entity";
import { ListScreeningsParams, listScreeningsValidation } from "src/screenings/validation/list-screenings.schema";

@Controller('rooms')
export class RoomsController {
    constructor(
        private readonly roomsService: RoomsService,
        private readonly screeningsService: ScreeningsService
    ) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste toutes les salles en prenant en compte les query parameters donnés."})
    @ApiQuery({name: 'name', description: "Filtre les salles par leur nom.", example: "Salle 01", type: string, required: false})
    @ApiQuery({name: 'type', description: "Filtre les salles par leur type.", example: "IMAX", type: string, required: false})
    @ApiQuery({name: 'minCapacity', description: "Montre seulement les salles avec une capacité supérieure au nombre donné.", example: "16", type: number, required: false})
    @ApiQuery({name: 'maxCapacity', description: "Montre seulement les salles avec une capacité inférieure au nombre donné.", example: "20", type: number, required: false})
    @ApiQuery({name: 'handicapAccess', description: "Filtre les salles selon leur propriété handicapAccess.", example: "false", type: boolean, required: false})
    @ApiQuery({name: 'maintenance', description: "Filtre les salles selon si elles sont en maintenance ou pas.", example: "true", type: boolean, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre de salles par page.", minimum: 1})
    getRooms(
        @Query(new JoiValidationPipe(listRoomsValidation)) queryParams: ListRoomsParam & PaginationRequest,
        @Req() req : Request
    ) : Promise<ListingReturn<Room>> {
        return this.roomsService.findAll(queryParams, req);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente la salle d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la salle à présenter.", example: 1, type: number})
    getRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Req() req : Request
    ) {
        return this.roomsService.findById(params, req);
    }

    @Get(':id/planning')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente les projections qui auront lieu de la salle d'ID donné en appliquant les paramètres passés dans l'URL."})
    @ApiParam({name: 'id', description: "ID de la salle concernée.", example: 1, type: number})
    @ApiQuery({name: "startsAfter", description: "Les projections listées débutent après cette date au format ISO 8601.", example: "2025-05-06T18:00:00Z", type: string, required: false})
    @ApiQuery({name: "startsBefore", description: "Les projections listées débutent avant cette date au format ISO 8601.", example: "2025-05-07T19:35:00Z", type: string, required: false})
    @ApiQuery({name: "endsAfter", description: "Les projections listées terminent après cette date au format ISO 8601.", example: "2025-10-18T18:46:00Z", type: string, required: false})
    @ApiQuery({name: "endsBefore", description: "Les projections listées terminent avant cette date au format ISO 8601.", example: "2025-11-28T10:04:00Z", type: string, required: false})
    @ApiQuery({name: "movieId", description: "Filtre les projections selon l'ID du film qu'elles projettent.", example: 1, type: number, minimum: 1, required: false})
    @ApiQuery({name: "movieTitle", description: "Filtre les projections selon le titre du film qu'elles projettent.", example: 1, type: number, minimum: 1, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre d'utilisateurs par page.", minimum: 1})
    listRoomScreenings(
        @Param(new JoiValidationPipe(roomIdValidation)) params : RoomId,
        @Query(new JoiValidationPipe(listScreeningsValidation)) queryParams : ListScreeningsParams & PaginationRequest
    ) : Promise<ListingReturn<Screening>> {
        queryParams.roomId = params.id
        queryParams.roomName = undefined
        return this.screeningsService.listScreenings(queryParams)
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({summary: "Crée une salle avec les informations données."})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createRoomValidation), UniqueRoomPipe)
    createRoom(@Body() reqBody: CreateRoomRequest) {
        return this.roomsService.createRoom(reqBody);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Modifie la salle d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la salle à modifier.", example: '1', type: number})
    @SetRoles(Roles.admin)
    updateRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Body(new JoiValidationPipe(updateRoomValidation)) reqBody: UpdateRoomRequest
    ) {
        return this.roomsService.updateRoom({...reqBody, ...params});
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Supprime la salle d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la salle à supprimer.", example: '1', type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe)
    deleteRoom(@Param() params: RoomId) {
        return this.roomsService.deleteRoom(params);
    }

    @Post('seed')
    @ApiOperation({summary: "Ajoute des salles en base de données."})
    @Public()
    seedRooms() {
        return this.roomsService.seedRooms();
    }
}