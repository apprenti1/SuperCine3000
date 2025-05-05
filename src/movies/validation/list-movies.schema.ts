import Joi from "joi"
import { PaginationRequest } from "src/common/validation/PaginationRequest"

export interface ListMoviesParams{
    title?: string
    director?: string
    genre?: string
    maxDuration?: string
    minDuration?: string
    duration?: string
}

export const listMoviesParamsValidation = Joi.object<ListMoviesParams & PaginationRequest>({
    title: Joi.string().min(1).max(100),
    director: Joi.string().min(2).max(100),
    genre: Joi.string().min(3).max(50),
    duration: Joi.string().min(2).max(50),
    maxDuration: Joi.string().min(2).max(50),
    minDuration: Joi.string().min(2).max(50),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
}).options({abortEarly: false})