import * as Joi from 'joi';

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  images?: string[];
  type?: string;
  capacity?: number;
  handicapAccess?: boolean;
}

export const updateRoomValidation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string().uri()).min(1),
  type: Joi.string(),
  capacity: Joi.number().integer().min(1),
  handicapAccess: Joi.boolean(),
}).min(1);