import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { CreateUserRequest, createUserValidation } from "./validation/create-user.schema";
import { ExistingUserPipe, UniqueUserPipe } from "./validation/pipes/UserExistencePipe";
import { UserId, userIdValidation } from "./validation/user-id.schema";
import { UpdateUserRequest, updateUserValidation } from "./validation/update-user.schema";
import { ListUsersParam, listUsersValidation } from "./validation/list-users.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { Public } from "src/auth/decorators/public.decorator";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { number, string } from "joi";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { User } from "./user.entity";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController{
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listUsersValidation))
    @SetRoles(Roles.admin)
    @ApiOperation({summary: "Liste tous les utilisateurs."})
    @ApiQuery({name: 'username', example: 'michel', required: false, type: string, description: "Présente les utilisateurs avec le nom d'utilisateur donné."})
    @ApiQuery({name: 'email', required: false, type: string, description: "Présente les utilisateurs avec l'email donné."})
    @ApiQuery({name: 'walletMax', required: false, type: number, description: "Présente ceux avec une quantité d'argent inférieure à celle donnée."})
    @ApiQuery({name: 'walletMin', required: false, type: number, description: "Présente ceux avec une quantité d'argent supérieure à celle donnée."})
    @ApiQuery({name: 'wallet', required: false, type: number, description: "Présente ceux ayant la quantité d'argent donnée exactement."})
    @ApiQuery({name: 'role', required: false, type: string, description: "Présente ceux ayant le rôle donné. Valeurs possibles : customer ou admin."})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre d'utilisateurs par page.", minimum: 1})
    getUsers(@Query() queryParams: ListUsersParam & PaginationRequest) : Promise<ListingReturn<User>> {
        return this.usersService.findAll(queryParams)
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(userIdValidation), ExistingUserPipe)
    @ApiOperation({summary: "Présente un utilisateur donné."})
    @ApiParam({name: 'id', required: true, description: "ID de l'utilisateur à récupérer.", example: 1,type: number})
    getUser(@Param() params: UserId){
        return this.usersService.findById(params.id)
    }

    @Post()
    @UsePipes(new JoiValidationPipe(createUserValidation), UniqueUserPipe)
    @Public()
    @ApiOperation({summary: "Enregistre un nouvel utilisateur."})
    register(@Body() reqBody : CreateUserRequest){
        return this.usersService.createUser(reqBody)
    }

    @Patch(':id')
    @SetRoles(Roles.admin)
    @ApiOperation({summary: "Modifie un utilisateur donné."})
    @ApiParam({name: 'id', required: true, description: "ID de l'utilisateur à modifier.", example: 1, type: number})
    updateUser(
        @Param(new JoiValidationPipe(userIdValidation), ExistingUserPipe) params: UserId,
        @Body(new JoiValidationPipe(updateUserValidation)) reqBody: UpdateUserRequest
    ){
        return this.usersService.updateUser({...reqBody, ...params})
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(userIdValidation), ExistingUserPipe)
    @ApiOperation({summary: "Supprime un utilisateur donné."})
    @ApiParam({name: 'id', required: true, description: "ID de l'utilisateur à supprimer.", example: 1,type: number})
    deleteUser(@Param() params: UserId){
        return this.usersService.deleteUser(params)
    }

    @Post('seed')
    @Public()
    @ApiOperation({summary: "Fourni la base de données en utilisateurs."})
    seedUsers(){
        return this.usersService.seedUsers()
    }
}