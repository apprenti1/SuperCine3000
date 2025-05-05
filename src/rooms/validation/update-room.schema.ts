import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';

export class UpdateRoomRequest {
  @ApiProperty({
    example: 'Salle 02',
    required: true
  })
  name?: string

  @ApiProperty({
    example: 'Grande salle avec équipement Dolby Atmos.',
    required: true
  })
  description?: string

  @ApiProperty({
    example: [
      "https://example.com/images/grand-ecran-1.jpg",
      "https://example.com/images/grand-ecran-2.jpg"
    ],
    required: true
  })
  images?: string[]

  @ApiProperty({
    example: 'Evenementiel',
    required: true
  })
  type?: string

  @ApiProperty({
    example: 32,
    minimum: 15,
    maximum: 30,
    required: true
  })
  capacity?: number

  @ApiProperty({
    example: true,
    required: false
  })
  handicapAccess?: boolean

  @ApiProperty({
    example: false,
    required: false
  })
  maintenance?: boolean
}

export const updateRoomValidation = Joi.object<UpdateRoomRequest>({
  name: Joi.string(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string().uri()).min(1),
  type: Joi.string(),
  capacity: Joi.number().integer().min(1),
  handicapAccess: Joi.boolean(),
  maintenance: Joi.boolean()
}).options({abortEarly: false}).min(1);