import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY_PROVIDER } from "src/common/constants";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserRequest } from "./validation/create-user.schema";
import { hash } from "bcrypt";
import { UserId } from "./validation/user-id.schema";
import { UpdateUserRequest } from "./validation/update-user.schema";
import { ListUsersParam } from "./validation/list-users.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { InjectRepository } from "@nestjs/typeorm";
import { Roles } from "src/common/enums/roles.enum";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User)
        private userRepository : Repository<User>
    ) {}

    async findAll(queryParams: ListUsersParam & PaginationRequest) : Promise<ListingReturn<User>> {
        const query = this.userRepository.createQueryBuilder('user')

        // Applying filters 

        if(queryParams.email !== undefined)
            query.andWhere('user.email = :email', { email: queryParams.email })

        if(queryParams.username !== undefined)
            query.andWhere('user.username = :username', { username: queryParams.username })

        if(queryParams.role !== undefined)
            query.andWhere('user.role = :role', { role: queryParams.role })

        if(queryParams.wallet !== undefined)
            query.andWhere('user.wallet = :wallet', { wallet: queryParams.wallet })

        if(queryParams.walletMax !== undefined)
            query.andWhere('user.wallet <= :walletMax', { walletMax: queryParams.walletMax })

        if(queryParams.walletMin !== undefined)
            query.andWhere('user.wallet >= :walletMin', { walletMin: queryParams.walletMin })

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [users, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: users,
            meta: {
                limit: queryParams.limit,
                page: queryParams.page,
                total: total,
                totalPages: totalPages
            }
        }
    }

    async findById(id: number) {
        const user = this.userRepository.findOne({where: {id: id}})
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

        if(error.length !== 0)
            throw new BadRequestException(error)

        const updatedUser = await this.saveUser(foundUser)
        return updatedUser
    }

    async saveUser(user : User) : Promise<User> {
        return await this.userRepository.save(user)
    }

    async deleteUser(params: UserId){
        const deleted = await this.userRepository.delete(params.id)

        return deleted
    }

    async seedUsers() {
        const users : User[] = [
            new User(
                30000, 'admin@yopmail.com', 'admin', 'adminadmin', Roles.admin, 999, [], []
            ),
            new User(
                30001, 'michel@yopmail.com', 'michel', 'michelmichel', Roles.customer, 30, [], []
            ),
            new User(
                30002, 'germaine@yopmail.com', 'germaine', 'germainegermaine', Roles.customer, 300, [], []
            ),
            new User(
                30003, 'alphonse@yopmail.com', 'alphonse', 'alphonsealphonse', Roles.customer, 50, [], []
            ),
            new User(
                30004, 'jean.marc@yopmail.com', 'jean-marc', 'jean-marc92', Roles.customer, 64, [], []
            ),
            new User(
                30005, 'remi@yopmail.com', 'remi', 'remiremiremi', Roles.customer, 2, [], []
            ),
        ]

        let i = 0
        for(const user of users){
            const existing = await this.findByUsername(user.username)
            if(existing === null){
                user.password = await hash(user.password, parseInt(process.env.SALT ?? '10'))
                await this.saveUser(user)
                ++i
            }
        }

        return {message: i + ' users seeded.'}
    }
}
