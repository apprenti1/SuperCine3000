import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class UpdateScreeningRequest{
    @ApiProperty({
        example: "2025-05-06T18:00:00Z",
        required: false,
        description: "Horodatage du début de la projection au format ISO 8601."
    })
    startsAt?: string

    @ApiProperty({
        example: 1,
        required: false,
        minimum: 1,
        description: "Requis sans `roomName`."
    })
    roomId?: string

    @ApiProperty({
        example: 'Salle 01',
        required: false,
        description: "Requis sans `roomId`."
    })
    roomName?: string

    @ApiProperty({
        example: 5,
        minimum: 1,
        required: false
    })
    movieId?: number
}

export const updateScreeningValidation = Joi.object<UpdateScreeningRequest>({
    startsAt: Joi.date().iso(),
    roomId: Joi.string().uuid(),
    roomName: Joi.string(),
    movieId: Joi.number().integer().min(1)
}).without('roomId', 'roomName').options({abortEarly: false})