import Joi from "joi";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

export interface PatchTransactionRequest{
    amount?: number,
    type?: TransactionTypes,
    userId?: number
}

export const patchTransactionValidation = Joi.object<PatchTransactionRequest>({
    amount: Joi.number().min(0),
    type: Joi.string().valid(...Object.values(TransactionTypes) as string[]),
    userId: Joi.number().min(1)
}).options({abortEarly: false})