import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY_PROVIDER } from "src/constants";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserRequest } from "./validation/create-user.schema";
import { hash } from "bcrypt";
import { UserId } from "./validation/user-id.schema";
import { UpdateUserRequest } from "./validation/update-user.schema";

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

    async updateUser(updateUserReq: UpdateUserRequest & UserId){
        const foundUser = await this.userRepository.findOne({where: {id: updateUserReq.id}})
        if(foundUser === null)
            throw new NotFoundException('User not found.')

        let error : string[] = []
        // Username unicity checking
        if(updateUserReq.username && foundUser.username !== updateUserReq.username){
            const checkUsername = await this.findByUsername(updateUserReq.username)
            if(checkUsername !== null)
                error.push('Choose another username.')
            else
                foundUser.username = updateUserReq.username
        }

        // Email unicity checking
        if(updateUserReq.email && foundUser.email !== updateUserReq.email){
            const checkEmail = await this.findByEmail(updateUserReq.email)
            if(checkEmail !== null)
                error.push('Use another email.')
            else
                foundUser.email = updateUserReq.email
        }

        // Negative wallet checking
        if(updateUserReq.transactionAmount){
            const newWallet = updateUserReq.transactionAmount + foundUser.wallet
            if(newWallet < 0)
                error.push("Wallet can't be negative")
            else
                foundUser.wallet = newWallet
        }
        if(error.length !== 0)
            throw new BadRequestException(error)

        const updatedUser = await this.userRepository.save(foundUser)
        return updatedUser
    }

    async deleteUser(params: UserId){
        const deleted = await this.userRepository.delete(params.id)

        return deleted
    }
}
