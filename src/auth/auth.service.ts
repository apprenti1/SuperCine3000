import { BadRequestException, Injectable, UsePipes } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginRequest } from './validation/login.schema';
import { User } from 'src/users/user.entity';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly accessTokensService: TokensService
    ) {}

    async login(userInfo: LoginRequest) {
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

        // Token creation
        const token = await this.accessTokensService.createToken(user)

        return token
    }

    async logout(req: Request) {
        // We cast the token as string because we already checked its existence in the RolesGuard
        const token = req['user'].token
        const deletedToken = await this.accessTokensService.deleteTokenByToken(token)

        return deletedToken
    }

    refresh() {
        return 'wip'
    }
}
