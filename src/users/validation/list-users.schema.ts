import { Roles } from "src/common/enums/roles.enum";
import Joi from "joi"
import { PaginationRequest } from "src/common/validation/PaginationRequest";

export interface ListUsersParam{
    username?: string,
    email?: string,
    walletMax?: number,
    walletMin?: number,
    wallet?: number,
    role?: Roles
}

export const listUsersValidation = Joi.object<ListUsersParam & PaginationRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    walletMax: Joi.number().min(0),
    walletMin: Joi.number().min(0),
    wallet: Joi.number().min(0),
    role: Joi.string().valid(...Object.values(Roles) as string[]),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
}).options({abortEarly: false})