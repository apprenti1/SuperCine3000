import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { TokensService } from "src/tokens/tokens.service";
import { RequestAccessTokenPayload } from "src/tokens/interfaces/access-token-payload.interface";
import { IS_PUBLIC_KEY, SET_ROLES_KEY } from "src/common/constants";
import { Roles } from "src/common/enums/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokensService: TokensService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        //If the route is public we go
        const isPublic : boolean | undefined = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        if(isPublic === true) return true
        
        // We get the token from the request
        const req : Request = context.switchToHttp().getRequest()
        if (req.url === '/metrics') return true;
        const token = this.extractAccessTokenFromHeader(req)
        if(token === undefined)
            throw new UnauthorizedException('Authentication required.')

        // Token validation
        let payload : RequestAccessTokenPayload
        try {
            // Throw an error if the token is not in the database
            await this.tokensService.getTokenByToken(token)

            // Throw an error if the token is invalid or expired
            payload = await this.tokensService.getTokenPayload(token) as RequestAccessTokenPayload
            req['user'] = {...payload, token: token}
        } catch (error) {
            throw new UnauthorizedException('Invalid token.')
        }

        // We get the roles and we check if it matches
        const allowedRoles : Roles[] = this.reflector.getAllAndMerge(SET_ROLES_KEY, [context.getHandler(), context.getClass()])

        // If no roles are set, it means you just need to be logged in
        if(allowedRoles.length === 0) return true

        const found = allowedRoles.find((role) => role === payload.role)
        if(found === undefined)
            throw new ForbiddenException('You are not allowed to access this.')

        return true
    }

    private extractAccessTokenFromHeader(request: Request) : string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}