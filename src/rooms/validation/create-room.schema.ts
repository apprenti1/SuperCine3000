import { ApiProperty } from '@nestjs/swagger';
import Joi from 'joi';

export class CreateRoomRequest {
  @ApiProperty({
    example: 'Salle 01',
    required: true
  })
  name: string

  @ApiProperty({
    example: 'Grande salle avec équipement Dolby Atmos',
    required: true
  })
  description: string

  @ApiProperty({
    example: [
      "https://example.com/images/grand-ecran-2.jpg",
      "https://example.com/images/grand-ecran-3.jpg"
    ],
    required: true
  })
  images: string[]

  @ApiProperty({
    example: 'IMAX',
    required: true
  })
  type: string

  @ApiProperty({
    example: 32,
    minimum: 15,
    maximum: 30,
    required: true
  })
  capacity: number

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

export const createRoomValidation = Joi.object<CreateRoomRequest>({
  name: Joi.string().required(),
  description: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  type: Joi.string().required(),
  capacity: Joi.number().integer().min(15).max(30).required(),
  handicapAccess: Joi.boolean().default(false),
  maintenance: Joi.boolean().default(false)
}).options({abortEarly: false});