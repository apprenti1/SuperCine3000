import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";
import { TicketTypes } from "src/common/enums/tickets-type.enum";

export class UpdateTicketRequest{
    @ApiProperty({
        example: TicketTypes.classic,
        required: false,
        description: `Les valeurs possibles sont : ${TicketTypes.classic} et ${TicketTypes.super}. Un super ticket peut être utilisé 10 fois.`
    })
    type?: TicketTypes

    @ApiProperty({
        example: 1,
        required: false
    })
    userId?: number

    @ApiProperty({
        example: 'michel',
        required: false
    })
    username?: string
}

export const updateTicketValidation = Joi.object<UpdateTicketRequest>({
    type: Joi.string().valid(...Object.values(TicketTypes) as string[]),
    userId: Joi.number().integer().min(1),
    username: Joi.string().min(3)
}).without('userId', 'username').options({abortEarly: false})