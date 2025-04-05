import Joi from "joi"

export interface UserId{
    id: number
}

export const userIdValidation = Joi.object<UserId>({
    id: Joi.number().required()
})