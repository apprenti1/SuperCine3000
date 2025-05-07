import Joi from 'joi';

export interface RoomId {
  id: number;
}

export const roomIdValidation = Joi.object<RoomId>({
  id: Joi.number().integer().min(1).required(),
});