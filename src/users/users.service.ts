import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY_PROVIDER } from "src/constants";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserRequest } from "./validation/create-user.schema";
import { hash } from "bcrypt";
import { UserId } from "./validation/user-id.schema";

@Injectable()
export class UsersService{
    constructor(
        @Inject(USER_REPOSITORY_PROVIDER)
        private userRepository : Repository<User>
    ) {}

    async findAll() {
        return this.userRepository.find()
    }

    async findById(params: UserId) {
        const user = this.userRepository.findOne({where: {id: params.id}})
        return user
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
        const hashedPassword = await hash(createUserBody.password, parseInt(process.env.SALT ?? '10'))
        const bodyCopy = {...createUserBody}
        bodyCopy.password = hashedPassword

        const user = this.userRepository.create(bodyCopy)
        const userCreated = await this.userRepository.save(user)

        return userCreated
    }

    async deleteUser(params: UserId){
        const deleted = await this.userRepository.delete(params.id)

        return deleted
    }
}
