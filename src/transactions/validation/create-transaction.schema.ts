import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

export class CreateTransactionRequest{
    @ApiProperty({
        example: 50,
        minimum: 0,
        required: true
    })
    amount: number

    @ApiProperty({
        example: TransactionTypes.deposit,
        required: true,
        description: "Valeurs possibles : 'withdrawal', 'deposit'"
    })
    type: TransactionTypes

    @ApiProperty({
        example: 'michel',
        required: false,
        description: "Nom de l'auteur de la transaction. Ne coexiste pas avec 'userId'."
    })
    username?: string

    @ApiProperty({
        example: 5,
        required: false,
        minimum: 1,
        description: "ID de l'auteur de la transaction. Ne coexiste pas avec 'username'."
    })
    userId?: number
}

export const createTransactionValidation = Joi.object<CreateTransactionRequest>({
    amount: Joi.number().min(0).required(),
    type: Joi.string().valid(...Object.values(TransactionTypes) as string[]).required(),
    username: Joi.string().min(3),
    userId: Joi.number().min(1)
}).options({abortEarly: false}).without('userId', 'username')