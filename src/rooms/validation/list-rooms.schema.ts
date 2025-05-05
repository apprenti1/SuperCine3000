import Joi from 'joi';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';

export interface ListRoomsParam {
  name?: string;
  type?: string;
  minCapacity?: number;
  maxCapacity?: number;
  handicapAccess?: boolean;
  maintenance?: boolean
}

export const listRoomsValidation = Joi.object<ListRoomsParam & PaginationRequest>({
  name: Joi.string(),
  type: Joi.string(),
  minCapacity: Joi.number().integer().min(1),
  maxCapacity: Joi.number().integer().min(1),
  handicapAccess: Joi.boolean(),
  maintenance: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).options({abortEarly: false});