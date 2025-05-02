import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { ListTokensParams } from './validation/list-tokens.schema';
import { User } from 'src/users/user.entity';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, RequestAccessTokenPayload } from './interfaces/access-token-payload.interface';
import { TokensType } from 'src/common/enums/tokens-type.enum';
import ms, { StringValue } from 'ms';
import { RefreshTokenPayload, RequestRefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
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

    async createAccessToken(user: User) : Promise<string> {
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
            expiresAt: new Date(Date.now() + ms(process.env.JWT_EXPIRES_IN as StringValue))
        })

        const savedToken = await this.tokensRepository.save(token)

        return savedToken.token
    }

    async createRefreshToken(user: User) : Promise<string> {
        const payload : RefreshTokenPayload = {
            sub: user.id
        }

        const expiresIn = '5 days'
        const token = this.tokensRepository.create({
            token: await this.jwtService.signAsync(payload, {expiresIn: expiresIn}),
            user: user,
            type: TokensType.refresh,
            expiresAt: new Date(Date.now() + ms(expiresIn))
        })

        const savedToken = await this.tokensRepository.save(token)

        return savedToken.token
    }

    async deleteToken(id: number) {
        const deletedToken = await this.tokensRepository.delete(id)

        if(deletedToken.affected === 0)
            throw new NotFoundException('Token does not exist.')

        return deletedToken
    }

    async deleteTokenByToken(token: string) {
        const deletedToken = await this.tokensRepository.delete({token: token})

        if(deletedToken.affected === 0) // This shouldn't be used since token has been verified
            throw new NotFoundException('Token does not exist.')

        return deletedToken
    }

    async deleteTokensByUserId(userId: number){
        const deletedTokens = await this.tokensRepository.delete({
            user: {id: userId}
        })

        if(deletedTokens.affected === 0)
            throw new NotFoundException('Token does not exist.')

        return deletedTokens
    }

    async getTokenPayload(token : string) : Promise<RequestAccessTokenPayload | RequestRefreshTokenPayload>{
        return await this.jwtService.verifyAsync(
            token,
            {
                secret: process.env.JWT_SECRET
            }
        )
    }
}
