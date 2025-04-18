import * as Joi from 'joi';

export interface CreateRoomRequest {
  name: string;
  description: string;
  images: string[];
  type: string;
  capacity: number;
  handicapAccess?: boolean;
}

export const createRoomValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  type: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  handicapAccess: Joi.boolean().default(false),
});