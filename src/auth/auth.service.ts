import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginRequest } from './validation/login.schema';
import { User } from 'src/users/user.entity';
import { compare } from 'bcrypt';
import { TokensService } from 'src/tokens/tokens.service';
import { Request } from 'express';
import { LoginReturn } from './interfaces/login-return.interface';
import { RefreshRequest } from './validation/refresh.schema';
import { RequestRefreshTokenPayload } from 'src/tokens/interfaces/refresh-token-payload.interface';
import ms from 'ms';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService
    ) {}

    async login(userInfo: LoginRequest): Promise<LoginReturn> {
        let user : User | null = null

        if(userInfo.username !== undefined)
            user = await this.usersService.findByUsername(userInfo.username)
        else if(userInfo.email !== undefined)
            user = await this.usersService.findByEmail(userInfo.email)

        if(user === null)
            throw new BadRequestException('Wrong credentials.')

        const isValid = await compare(userInfo.password, user.password)
        if(!isValid)
            throw new BadRequestException('Wrong credentials.')

        // Tokens creation
        const accessToken = await this.tokensService.createAccessToken(user)
        const refreshToken = await this.tokensService.createRefreshToken(user)

        const tokens : LoginReturn = {
            access_token: accessToken,
            refresh_token: refreshToken
        }

        return tokens
    }

    async logout(req: Request) {
        const userId = req['user'].sub
        const deletedToken = await this.tokensService.deleteTokensByUserId(userId)

        return deletedToken
    }

    async refresh(refreshRequest : RefreshRequest) : Promise<LoginReturn>{
        let [type, refreshToken] = refreshRequest.refresh_token.split(' ') ?? []
        if(type !== 'Bearer')
            throw new UnauthorizedException('Refresh token is invalid.')

        let refreshTokenPayload : RequestRefreshTokenPayload
        try{
            // Throw an error if not found
            await this.tokensService.getTokenByToken(refreshToken)

            // Throw an error if invalid
            refreshTokenPayload = await this.tokensService.getTokenPayload(refreshToken)
        } catch{
            throw new UnauthorizedException('Refresh token is invalid.')
        }
        
        const user = await this.usersService.findById(refreshTokenPayload.sub)
        if(user === null)
            throw new NotFoundException('User not found')

        const accessToken = await this.tokensService.createAccessToken(user)

        //If the refresh token is about to expire, we refresh it too
        if(refreshTokenPayload.exp >= Date.now() + ms('10min'))
            refreshToken = await this.tokensService.createRefreshToken(user)


        return {
            access_token: accessToken,
            refresh_token: refreshToken
        }
    }
}
