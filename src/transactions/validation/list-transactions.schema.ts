import Joi from "joi"
import { TransactionTypes } from "src/common/enums/transactions-type.enum";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

export interface ListTransactionsParam{
    type?: TransactionTypes,
    maxAmount?: number,
    minAmount?: number,
    amount?: number,
    userId?: number,
    username?: string
}

export type ListTransactionsRequest = ListTransactionsParam & PaginationRequest

export const listTransactionsValidation = Joi.object<ListTransactionsRequest>({
    maxAmount: Joi.number().min(Joi.ref('minAmount')),
    minAmount: Joi.number().min(0),
    amount: Joi.number().min(0),
    type: Joi.string().valid(...Object.values(TransactionTypes) as string[]),
    username: Joi.string().min(3),
    userId: Joi.number().min(1),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
}).options({abortEarly: false})