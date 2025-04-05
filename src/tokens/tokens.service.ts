import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TOKENS_REPOSITORY_PROVIDER } from 'src/common/constants';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { ListTokensParams } from './validation/list-tokens.schema';
import { User } from 'src/users/user.entity';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './interfaces/access-token-payload.interface';
import { AccessTokenReturn } from './interfaces/access-token-return.interface';
import { TokensType } from 'src/common/enums/tokens-type.enum';
import ms from 'ms';

@Injectable()
export class TokensService {
    constructor(
        @Inject(TOKENS_REPOSITORY_PROVIDER)
        private tokensRepository: Repository<Token>,
        private readonly jwtService: JwtService
    ) {}

    async getTokens(queryParams: ListTokensParams & PaginationRequest) {
        const query = this.tokensRepository.createQueryBuilder('token')

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
        const token = await this.tokensRepository.findOne({where: {id: id}})

        if(token === null)
            throw new NotFoundException('Token does not exist.')

        return token
    }

    async getTokenByToken(token: string) {
        const tokenLine = await this.tokensRepository.findOne({where: {token: token}})

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

        const token = this.tokensRepository.create({
            token: await this.jwtService.signAsync(payload),
            user: user,
            type: TokensType.access,
            expiresAt: new Date(Date.now() + ms('300s')) // cast 'cause it's needed
        })

        const savedToken = await this.tokensRepository.save(token)

        return {
            access_token: savedToken.token
        }
    }

    async deleteToken(id: number) {
        const deletedToken = await this.tokensRepository.delete(id)

        if(deletedToken.affected === 0)
            throw new NotFoundException('Token does not exist.')

        return deletedToken
    }

    async deleteTokenByToken(token: string) {
        console.log(token)
        const deletedToken = await this.tokensRepository.delete({token: token})

        if(deletedToken.affected === 0) // This shouldn't be used since token has been verified
            throw new NotFoundException('Token does not exist.')

        return deletedToken
    }
}
