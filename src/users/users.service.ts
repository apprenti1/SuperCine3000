import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY_PROVIDER } from "src/constants";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService{
    constructor(
        @Inject(USER_REPOSITORY_PROVIDER)
        private userRepository : Repository<User>
    ) {}

    async findAll() {
        return this.userRepository.find()
    }
}
