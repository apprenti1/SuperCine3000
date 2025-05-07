import Joi from "joi";
import { TicketTypes } from "src/common/enums/tickets-type.enum";
import { PaginationRequest } from "src/common/validation/PaginationRequest";

export interface ListTicketsParams{
    type?: TicketTypes
    ownerId?: number,
    ownerName?: string,
    screeningId?: number,
    used?: boolean
}

export const listTicketsParamsValidation = Joi.object<ListTicketsParams & PaginationRequest>({
    type: Joi.string().valid(...Object.values(TicketTypes) as string[]),
    ownerId: Joi.number().integer().min(1),
    ownerName: Joi.string().min(3),
    screeningId: Joi.number().integer().min(1),
    used: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
})