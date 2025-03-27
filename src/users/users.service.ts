import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY_PROVIDER } from "src/constants";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserRequest } from "./validation/create-user.schema";

@Injectable()
export class UsersService{
    constructor(
        @Inject(USER_REPOSITORY_PROVIDER)
        private userRepository : Repository<User>
    ) {}

    async findAll() {
        return this.userRepository.find()
    }

    async findByEmail(email: string) {
        const user = this.userRepository.findOne({where: {email: email}})
        return user
    }

    async findByUsername(username: string) {
        const user = this.userRepository.findOne({where: {username: username}})
        return user
    }

    async createUser(createUserBody: CreateUserRequest){
        const user = this.userRepository.create({...createUserBody})
        const userCreated = await this.userRepository.save(user)

        return userCreated
    }
}
