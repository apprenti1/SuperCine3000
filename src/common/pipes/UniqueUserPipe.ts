import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";

@Injectable()
export class UniqueUserPipe implements PipeTransform{
    constructor(
        private readonly usersService: UsersService
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        if(value.username){
            const userByUsername = await this.usersService.findByUsername(value.username)
            if(userByUsername)
                throw new BadRequestException("Choose another username.")
        }

        if(value.email){
            const userByEmail = await this.usersService.findByEmail(value.email)
            if(userByEmail)
                throw new BadRequestException("Use another email.")
        }

        return value
    }
}