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

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste toutes les salles en prenant en compte les query parameters donnés."})
    @ApiQuery({name: 'name', description: "Filtre les salles par leur nom.", example: "Salle 01", type: string, required: false})
    @ApiQuery({name: 'type', description: "Filtre les salles par leur type.", example: "IMAX", type: string, required: false})
    @ApiQuery({name: 'minCapacity', description: "Montre seulement les salles avec une capacité supérieure au nombre donné.", example: "16", type: number, required: false})
    @ApiQuery({name: 'maxCapacity', description: "Montre seulement les salles avec une capacité inférieure au nombre donné.", example: "20", type: number, required: false})
    @ApiQuery({name: 'handicapAccess', description: "Filtre les salles selon leur propriété handicapAccess.", example: "false", type: boolean, required: false})
    @ApiQuery({name: 'maintenance', description: "Filtre les salles selon si elles sont en maintenance ou pas.", example: "true", type: boolean, required: false})
    getRooms(
        @Query(new JoiValidationPipe(listRoomsValidation)) queryParams: ListRoomsParam & PaginationRequest,
        @Req() req : Request
    ) : Promise<ListingReturn<Room>> {
        return this.roomsService.findAll(queryParams, req);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente la salle d'ID donné."})
    @ApiParam({name: 'id', description: "ID de la salle à présenter.", example: 'f63c7f30-1727-42b0-be12-ec0718c96b1d', type: string})
    getRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Req() req : Request
    ) {
        return this.roomsService.findById(params, req);
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
    @ApiParam({name: 'id', description: "ID de la salle à modifier.", example: 'f63c7f30-1727-42b0-be12-ec0718c96b1d', type: string})
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
    @ApiParam({name: 'id', description: "ID de la salle à supprimer.", example: 'f63c7f30-1727-42b0-be12-ec0718c96b1d', type: string})
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