import { ArgumentMetadata, BadRequestException, Inject, Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";

@Injectable()
export class UserExistencePipe implements PipeTransform{
    constructor(
        protected readonly usersService: UsersService,
        protected checkUnicity: boolean
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        if(value.id){
            const userById = await this.usersService.findById(value.id)
            if(userById && this.checkUnicity)
                throw new BadRequestException("Choose another username.")

            if(!userById && !this.checkUnicity)
                throw new NotFoundException("User not found.")
        }

        if(value.username){
            const userByUsername = await this.usersService.findByUsername(value.username)
            if(userByUsername && this.checkUnicity)
                throw new BadRequestException("Choose another username.")

            if(!userByUsername && !this.checkUnicity)
                throw new NotFoundException("User not found.")
        }

        if(value.email){
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