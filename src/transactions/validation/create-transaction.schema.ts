import Joi from "joi";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

export interface CreateTransactionRequest{
    amount: number,
    type: TransactionTypes,
    username?: string,
    userId?: number
}

export const createTransactionValidation = Joi.object<CreateTransactionRequest>({
    amount: Joi.number().min(0).required(),
    type: Joi.string().valid(...Object.values(TransactionTypes) as string[]).required(),
    username: Joi.string().min(3),
    userId: Joi.number().min(1)
}).options({abortEarly: false}).without('userId', 'username')