import Joi from "joi";

export interface ListScreeningsParams{
    startsAfter?: string,
    startsBefore?: string,
    endsAfter?: string,
    endsBefore?: string,
    roomName?: string,
    roomId?: number,
    movieId?: number
}

export const listScreeningsValidation = Joi.object<ListScreeningsParams>({
    startsAfter: Joi.date().iso(),
    startsBefore: Joi.date().iso(),
    endsAfter: Joi.date().iso(),
    endsBefore: Joi.date().iso(),
    roomId: Joi.string().uuid(),
    roomName: Joi.string(),
    movieId: Joi.number().integer().min(1)
}).options({abortEarly: false})