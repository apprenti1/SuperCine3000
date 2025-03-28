import * as Joi from "joi";

export interface UpdateUserRequest {
    username?: string,
    email?: string,
    transactionAmount?: number
}

export const updateUserValidation = Joi.object<UpdateUserRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    transactionAmount: Joi.number() // Positive = credit, negative = payement
}).options({abortEarly: false})