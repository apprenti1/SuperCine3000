import Joi from "joi"

export interface TokenId{
    id: number
}

export const tokenIdValidation = Joi.object<TokenId>({
    id: Joi.number().min(0).required()
}).options({abortEarly: false})