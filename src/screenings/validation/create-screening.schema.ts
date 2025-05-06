import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class CreateScreeningRequest{
    @ApiProperty({
        example: "2025-05-06T18:00:00Z",
        required: true,
        description: "Horodatage du début de la projection au format ISO 8601."
    })
    startsAt: string

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
        required: true
    })
    movieId: number
}

export const createScreeningValidation = Joi.object<CreateScreeningRequest>({
    startsAt: Joi.date().iso().required(),
    roomId: Joi.string().uuid(),
    roomName: Joi.string(),
    movieId: Joi.number().integer().min(1).required()
}).options({abortEarly: false})
.xor('roomId', 'roomName').messages({
    'object.missing': "At least `roomId` `roomName` should be given.",
    'object.xor': "`roomId` and `roomName` can't be given together."
})