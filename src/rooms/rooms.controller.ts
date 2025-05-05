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

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    getRooms(
        @Query(new JoiValidationPipe(listRoomsValidation)) queryParams: ListRoomsParam & PaginationRequest,
        @Req() req : Request
    ) : Promise<ListingReturn<Room>> {
        return this.roomsService.findAll(queryParams, req);
    }

    @Get(':id')
    getRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Req() req : Request
    ) {
        return this.roomsService.findById(params, req);
    }

    @Post()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createRoomValidation), UniqueRoomPipe)
    createRoom(@Body() reqBody: CreateRoomRequest) {
        return this.roomsService.createRoom(reqBody);
    }

    @Patch(':id')
    @SetRoles(Roles.admin)
    updateRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Body(new JoiValidationPipe(updateRoomValidation)) reqBody: UpdateRoomRequest
    ) {
        return this.roomsService.updateRoom({...reqBody, ...params});
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe)
    deleteRoom(@Param() params: RoomId) {
        return this.roomsService.deleteRoom(params);
    }

    @Post('seed')
    @Public()
    seedRooms() {
        return this.roomsService.seedRooms();
    }
}