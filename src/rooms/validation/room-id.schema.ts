import * as Joi from 'joi';

export interface RoomId {
  id: string;
}

export const roomIdValidation = Joi.object({
  id: Joi.string().uuid().required(),
});