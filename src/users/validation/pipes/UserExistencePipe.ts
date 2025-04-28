import { ArgumentMetadata, BadRequestException, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { CreateUserRequest } from "src/users/validation/create-user.schema";
import { UserId } from "src/users/validation/user-id.schema";

@Injectable()
export class UserExistencePipe implements PipeTransform{
    constructor(
        protected readonly usersService: UsersService,
        protected checkUnicity: boolean
    ) {}

    async transform(value: CreateUserRequest & UserId, metadata: ArgumentMetadata) {
        // We compare to undefined so 0 is checked too
        if(value.id !== undefined){
            const userById = await this.usersService.findById(value.id)
            if(userById && this.checkUnicity)
                throw new BadRequestException("Choose another username.")

            if(!userById && !this.checkUnicity)
                throw new NotFoundException("User not found.")
        }

        if(value.username !== undefined){
            const userByUsername = await this.usersService.findByUsername(value.username)
            if(userByUsername && this.checkUnicity)
                throw new BadRequestException("Choose another username.")

            if(!userByUsername && !this.checkUnicity)
                throw new NotFoundException("User not found.")
        }

        if(value.email !== undefined){
            const userByEmail = await this.usersService.findByEmail(value.email)
            if(userByEmail)
                throw new BadRequestException("Use another email.")

            if(!userByEmail && !this.checkUnicity)
                throw new NotFoundException("User not found.")
        }

        return value
    }
}

@Injectable()
export class UniqueUserPipe extends UserExistencePipe{
    constructor(usersService: UsersService){
        super(usersService, true)
    }
}

@Injectable()
export class ExistingUserPipe extends UserExistencePipe{
    constructor(usersService: UsersService){
        super(usersService, false)
    }
}