import { Roles } from "src/common/enums/roles.enum";

export interface AccessTokenPayload{
    sub: number,
    username: string,
    email: string,
    role: Roles
}