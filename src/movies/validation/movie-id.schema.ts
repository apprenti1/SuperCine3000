import Joi from "joi"

export interface MovieId{
    id: number
}

export const movieIdValidation = Joi.object<MovieId>({
    id: Joi.number().integer().min(1).required()
})