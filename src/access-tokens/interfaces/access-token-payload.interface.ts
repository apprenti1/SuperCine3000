import { Roles } from "src/common/enums/roles.enum";

// This interface represents the payload of the token the api MAKES
export interface AccessTokenPayload{
    sub: number,
    username: string,
    email: string,
    role: Roles
}

// This interface represents the payload of the token the api RECEIVES
export interface RequestTokenPayload{
    sub: number,
    username: string,
    email: string,
    role: Roles,
    iat: number,
    exp: number
}