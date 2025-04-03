import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ACCESS_TOKENS_REPOSITORY_PROVIDER, USER_REPOSITORY_PROVIDER } from 'src/common/constants';
import { Repository } from 'typeorm';
import { AccessToken } from './access-token.entity';
import { ListAccessTokensParams } from './validation/list-access-tokens.schema';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './interfaces/access-token-payload.interface';
import { AccessTokenReturn } from './interfaces/access-token-return.interface';

@Injectable()
export class AccessTokensService {
    constructor(
        @Inject(ACCESS_TOKENS_REPOSITORY_PROVIDER)
        private accessTokensRepository: Repository<AccessToken>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async getTokens(queryParams: ListAccessTokensParams & PaginationRequest) {
        const query = this.accessTokensRepository.createQueryBuilder('token')

        // Applying filters

        if(queryParams.ownerId !== undefined){
            const user = await this.usersService.findById({id: queryParams.ownerId})
            if(user !== null)
                query.orWhere('token.user = :user', {user: user.id})
        }

        if(queryParams.ownerEmail !== undefined){
            const user = await this.usersService.findByEmail(queryParams.ownerEmail)
            if(user !== null)
                query.orWhere('token.user = :user', {user: user.id})
        }

        if(queryParams.ownerUsername !== undefined){
            const user = await this.usersService.findByUsername(queryParams.ownerUsername)
            if(user !== null)
                query.orWhere('token.user = :user', {user: user.id})
        }

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [tokens, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: tokens,
            page_size: queryParams.limit,
            page: queryParams.page,
            total_entities: total,
            total_pages: totalPages
        }
    }

    async getTokenById(id: number) {
        const token = await this.accessTokensRepository.findOne({where: {id: id}})

        if(token === null)
            throw new NotFoundException('Token does not exist.')

        return token
    }

    async createToken(user: User) : Promise<AccessToken> {
        const payload : AccessTokenPayload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }

        const token = this.accessTokensRepository.create({
            token: await this.jwtService.signAsync(payload),
            user: user
        })

        const savedToken = await this.accessTokensRepository.save(token)

        return savedToken
    }

    async deleteToken(id: number) {
        const deleted_token = await this.accessTokensRepository.delete(id)

        if(deleted_token.affected === 0)
            throw new NotFoundException('Token does not exist.')

        return deleted_token
    }
}
