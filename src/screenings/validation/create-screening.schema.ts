import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class CreateScreeningRequest{
    @ApiProperty({
        // TODO EXEMPLE
        example: "2025-05-06T18:00:00Z",
        required: true,
        description: "Horodatage du début de la projection au format ISO 8601."
    })
    startsAt: string

    @ApiProperty({
        example: "2025-05-06T20:13:40Z",
        required: true,
        description: "Horodatage de la fin de la projection au format ISO 8601."
    })
    endsAt: string

    @ApiProperty({
        example: 1,
        required: false,
        minimum: 1,
        description: "Requis sans `roomName`."
    })
    roomId?: number

    @ApiProperty({
        example: 'Salle 01',
        required: false,
        description: "Requis sans `roomId`."
    })
    roomName?: string

    @ApiProperty({
        example: 5,
        minimum: 1,
        required: true
    })
    movieId: number
}

export const createScreeningValidation = Joi.object<CreateScreeningRequest>({
    startsAt: Joi.date().iso().required(),
    endsAt: Joi.date().iso().required(),
    roomId: Joi.number().integer().min(1),
    roomName: Joi.string(),
    movieId: Joi.number().integer().min(1).required()
}).xor('roomId', 'roomName').options({abortEarly: false})