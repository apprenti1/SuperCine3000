import Joi from "joi"

export interface ScreeningId{
    id: number
}

export const screeningIdValidation = Joi.object<ScreeningId>({
    id: Joi.number().integer().min(1).required()
})