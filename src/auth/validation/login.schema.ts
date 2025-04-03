import * as Joi from "joi";

export interface LoginRequest {
    username?: string,
    email?: string,
    password: string
}

export const loginValidation = Joi.object<LoginRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(20).required()
}).xor('username', 'email').options({abortEarly: false})