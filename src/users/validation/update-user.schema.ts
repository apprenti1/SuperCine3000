import Joi from "joi";

export interface UpdateUserRequest {
    username?: string
    email?: string
}

export const updateUserValidation = Joi.object<UpdateUserRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email()
}).options({abortEarly: false})