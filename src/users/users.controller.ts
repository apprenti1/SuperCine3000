import { Body, Controller, Get, Post, Req, UsePipes } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateUserRequest, createUserValidation } from "./validation/create-user.schema";
import { UniqueUserPipe } from "src/common/pipes/UniqueUserPipe";

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
}