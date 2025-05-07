import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";
import { TicketTypes } from "src/common/enums/tickets-type.enum";

export class CreateTicketRequest{
    @ApiProperty({
        example: TicketTypes.classic,
        required: true,
        description: `Les valeurs possibles sont : ${TicketTypes.classic} et ${TicketTypes.super}. Un super ticket peut être utilisé 10 fois.`
    })
    type: TicketTypes

    @ApiProperty({
        example: 1,
        required: false,
        description: "Ne peut être donné avec `username`. Si aucun des deux n'est donné, l'achat est fait pour l'utilisateur courant."
    })
    userId: number

    @ApiProperty({
        example: 'michel',
        required: false,
        description: "Ne peut être donné avec `userId`. Si aucun des deux n'est donné, l'achat est fait pour l'utilisateur courant."
    })
    username: string
}

export const createTicketValidation = Joi.object<CreateTicketRequest>({
    type: Joi.string().valid(...Object.values(TicketTypes) as string[]).required(),
    userId: Joi.number().integer().min(1),
    username: Joi.string().min(3)
}).without('userId', 'username').options({abortEarly: false})