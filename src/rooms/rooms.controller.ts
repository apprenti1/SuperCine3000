import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateRoomRequest, createRoomValidation } from "./validation/create-room.schema";
import { ExistingRoomPipe, UniqueRoomPipe } from "./validation/pipes/RoomExistencePipe";
import { RoomId, roomIdValidation } from "./validation/room-id.schema";
import { UpdateRoomRequest, updateRoomValidation } from "./validation/update-room.schema";
import { ListRoomsParam, listRoomsValidation } from "./validation/list-rooms.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listRoomsValidation))
    getRooms(@Query() queryParams: ListRoomsParam & PaginationRequest) {
        return this.roomsService.findAll(queryParams);
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe)
    getRoom(@Param() params: RoomId) {
        return this.roomsService.findById(params);
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createRoomValidation), UniqueRoomPipe)
    createRoom(@Body() reqBody: CreateRoomRequest) {
        return this.roomsService.createRoom(reqBody);
    }

    @Patch(':id')
    updateRoom(
        @Param(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe) params: RoomId,
        @Body(new JoiValidationPipe(updateRoomValidation)) reqBody: UpdateRoomRequest
    ) {
        return this.roomsService.updateRoom({...reqBody, ...params});
    }

    @Delete(':id')
    @UsePipes(new JoiValidationPipe(roomIdValidation), ExistingRoomPipe)
    deleteRoom(@Param() params: RoomId) {
        return this.roomsService.deleteRoom(params);
    }

    @Post('seed')
    seedRooms() {
        return this.roomsService.seedRooms();
    }
}