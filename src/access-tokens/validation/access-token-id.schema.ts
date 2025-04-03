import * as Joi from "joi"

export interface AccessTokenId{
    id: number
}

export const accessTokenIdValidation = Joi.object<AccessTokenId>({
    id: Joi.number().min(0).required()
}).options({abortEarly: false})