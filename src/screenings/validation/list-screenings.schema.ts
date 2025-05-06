import Joi from "joi";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

export interface ListScreeningsParams{
    startsAfter?: string,
    startsBefore?: string,
    endsAfter?: string,
    endsBefore?: string,
    roomName?: string,
    roomId?: number,
    movieId?: number,
    movieTitle?: string
}

export const listScreeningsValidation = Joi.object<ListScreeningsParams & PaginationRequest>({
    startsAfter: Joi.date().iso(),
    startsBefore: Joi.date().iso(),
    endsAfter: Joi.date().iso(),
    endsBefore: Joi.date().iso(),
    roomId: Joi.string().uuid(),
    roomName: Joi.string(),
    movieId: Joi.number().integer().min(1),
    movieTitle: Joi.string().min(1).max(100),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
}).options({abortEarly: false})