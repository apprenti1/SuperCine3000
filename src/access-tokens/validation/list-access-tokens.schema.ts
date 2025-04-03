import * as Joi from "joi"
import { PaginationRequest } from "src/common/validation/PaginationRequest"

export interface ListAccessTokensParams{
    ownerUsername?: string,
    ownerEmail?: string,
    ownerId?: number
}

export const listAccessTokensValidation = Joi.object<ListAccessTokensParams & PaginationRequest>({
    ownerUsername: Joi.string().min(3),
    ownerEmail: Joi.string().email(),
    ownerId: Joi.number().min(0),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
})