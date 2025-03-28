import { Roles } from "src/common/enums/roles.enum";
import * as Joi from "joi"

export interface ListUsersParam{
    username?: string,
    email?: string,
    walletMax?: number,
    walletMin?: number,
    wallet?: number,
    role?: Roles
}

export const listUsersValidation = Joi.object<ListUsersParam>({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    walletMax: Joi.number().min(0),
    walletMin: Joi.number().min(0),
    wallet: Joi.number().min(0),
    role: Joi.string().valid(...Object.values(Roles) as string[])
})