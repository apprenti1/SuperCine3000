import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateUserRequest, createUserValidation } from "./validation/create-user.schema";
import { ExistingUserPipe, UniqueUserPipe } from "./validation/pipes/UserExistencePipe";
import { UserId, userIdValidation } from "./validation/user-id.schema";
import { UpdateUserRequest, updateUserValidation } from "./validation/update-user.schema";
import { ListUsersParam, listUsersValidation } from "./validation/list-users.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listUsersValidation))
    getUsers(@Query() queryParams: ListUsersParam & PaginationRequest){
        return this.usersService.findAll(queryParams)
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(userIdValidation), ExistingUserPipe)
    getUser(@Param() params: UserId){
        return this.usersService.findById(params)
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createUserValidation), UniqueUserPipe)
    register(@Body() reqBody : CreateUserRequest){
        return this.usersService.createUser(reqBody)
    }

    @Patch(':id')
    updateUser(
        @Param(new JoiValidationPipe(userIdValidation), ExistingUserPipe) params: UserId,
        @Body(new JoiValidationPipe(updateUserValidation)) reqBody: UpdateUserRequest
    ){
        return this.usersService.updateUser({...reqBody, ...params})
    }

    @Delete(':id')
    @UsePipes(new JoiValidationPipe(userIdValidation), ExistingUserPipe)
    deleteUser(@Param() params: UserId){
        return this.usersService.deleteUser(params)
    }
}