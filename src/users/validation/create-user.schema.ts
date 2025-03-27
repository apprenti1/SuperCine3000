import * as Joi from "joi";

export interface CreateUserRequest {
    username: string,
    password: string,
    email: string
}

export const createUserValidation = Joi.object<CreateUserRequest>({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(8).max(20).required(),
    email: Joi.string().email().required()
}).options({abortEarly: false})