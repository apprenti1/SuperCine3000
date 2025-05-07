import Joi from "joi"

export interface TicketId{
    id: number
}

export const ticketIdValidation = Joi.object<TicketId>({
    id: Joi.number().integer().min(1).required()
})