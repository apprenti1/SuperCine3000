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
            query.orWhere('token.userId = :id', {id: queryParams.ownerId})
        }

        // We do this check to avoid making the jointure twice
        if(queryParams.ownerEmail !== undefined || queryParams.ownerUsername !== undefined){
            query.leftJoin('token.user', 'user')
        }

        // But we still have to check for each so the app doesn't crash
        if(queryParams.ownerEmail !== undefined){
            query.orWhere('user.email = :email', {email: queryParams.ownerEmail})
        }

        if(queryParams.ownerUsername !== undefined){
            query.orWhere('user.username = :username', {username: queryParams.ownerUsername})
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

    async getTokenByToken(token: string) {
        const tokenLine = await this.accessTokensRepository.findOne({where: {token: token}})

        if(tokenLine === null)
            throw new NotFoundException('Token does not exist.')

        return tokenLine
    }

    async createToken(user: User) : Promise<AccessTokenReturn> {
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

        return {
            access_token: savedToken.token
        }
    }

    async deleteToken(id: number) {
        const deleted_token = await this.accessTokensRepository.delete(id)

        if(deleted_token.affected === 0)
            throw new NotFoundException('Token does not exist.')

        return deleted_token
    }
}
