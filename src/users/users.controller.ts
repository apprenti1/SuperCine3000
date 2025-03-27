import { Body, Controller, Delete, Get, Param, Post, Req, UsePipes } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateUserRequest, createUserValidation } from "./validation/create-user.schema";
import { ExistingUserPipe, UniqueUserPipe } from "src/common/pipes/UserExistencePipe";
import { UserId, userIdValidation } from "./validation/user-id.schema";

@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers(){
        return this.usersService.findAll()
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createUserValidation), UniqueUserPipe)
    register(@Body() createUserBody : CreateUserRequest){
        return this.usersService.createUser(createUserBody)
    }

    @Delete(':id')
    @UsePipes(new JoiValidationPipe(userIdValidation), ExistingUserPipe)
    deleteUser(@Param() params: UserId){
        return this.usersService.deleteUser(params)
    }
}