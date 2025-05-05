import Joi from 'joi';

export interface CreateRoomRequest {
  name: string
  description: string
  images: string[]
  type: string
  capacity: number
  handicapAccess?: boolean
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