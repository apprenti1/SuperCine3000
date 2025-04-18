import * as Joi from 'joi';

export interface ListRoomsParam {
  name?: string;
  type?: string;
  minCapacity?: number;
  maxCapacity?: number;
  handicapAccess?: boolean;
}

export const listRoomsValidation = Joi.object({
  name: Joi.string(),
  type: Joi.string(),
  minCapacity: Joi.number().integer().min(1),
  maxCapacity: Joi.number().integer().min(1),
  handicapAccess: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});