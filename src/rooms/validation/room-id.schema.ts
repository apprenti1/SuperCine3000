import Joi from 'joi';

export interface RoomId {
  id: string;
}

export const roomIdValidation = Joi.object<RoomId>({
  id: Joi.string().uuid().required(),
});