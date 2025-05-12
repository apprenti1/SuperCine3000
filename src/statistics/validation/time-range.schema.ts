import Joi from "joi"

export interface TimeRangeRequest{
    startDate: string,
    endDate: string
}

export const timeRangeValidation = Joi.object<TimeRangeRequest>({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required()
}).options({abortEarly: false})