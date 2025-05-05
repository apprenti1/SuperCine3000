import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

export class PatchTransactionRequest{
    @ApiProperty({
        example: 51,
        minimum: 0,
        required: false
    })
    amount?: number

    @ApiProperty({
        example: TransactionTypes.withdrawal,
        required: false,
        description: "Valeurs possibles : 'withdrawal', 'deposit'"
    })
    type?: TransactionTypes
    
    @ApiProperty({
        example: 5,
        required: false,
        minimum: 1,
        description: "ID de l'auteur de la transaction. Ne coexiste pas avec 'username'."
    })
    userId?: number
}

export const patchTransactionValidation = Joi.object<PatchTransactionRequest>({
    amount: Joi.number().min(0),
    type: Joi.string().valid(...Object.values(TransactionTypes) as string[]),
    userId: Joi.number().min(1)
}).options({abortEarly: false})