import Joi from "joi"
import { TokensType } from "src/common/enums/tokens-type.enum"
import { PaginationRequest } from "src/common/validation/PaginationRequest"

export interface ListTokensParams{
    ownerUsername?: string,
    ownerEmail?: string,
    ownerId?: number,
    type?: TokensType
}

export const listTokensValidation = Joi.object<ListTokensParams & PaginationRequest>({
    ownerUsername: Joi.string().min(3),
    ownerEmail: Joi.string().email(),
    ownerId: Joi.number().min(0),
    type: Joi.string().valid(...Object.values(TokensType) as string[]),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
})