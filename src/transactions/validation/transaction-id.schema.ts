import Joi from "joi"

export interface TransactionId{
    id: number
}

export const transactionIdValidation = Joi.object<TransactionId>({
    id: Joi.number().required()
})