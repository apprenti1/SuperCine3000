import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UsePipes } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { ListTicketsParams, listTicketsParamsValidation } from "./validation/list-ticket.schema";
import { Ticket } from "./ticket.entity";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { TicketId, ticketIdValidation } from "./validation/ticket-id.schema";
import { CreateTicketRequest, createTicketValidation } from "./validation/create-ticket.schema";
import { Request } from "express";
import { UpdateTicketRequest, updateTicketValidation } from "./validation/update-ticket.schema";
import { DeleteResult } from "typeorm";

@Controller('tickets')
export class TicketsController{
    constructor(
        private readonly ticketsService : TicketsService
    ) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listTicketsParamsValidation))
    listTickets(@Query() queryParams: ListTicketsParams & PaginationRequest): Promise<ListingReturn<Ticket>> {
        return this.ticketsService.listTickets(queryParams)
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(ticketIdValidation))
    getTickets(@Param() params: TicketId) : Promise<Ticket> {
        return this.ticketsService.getTicket(params)
    }

    @Post()
    createTicket(
        @Body(new JoiValidationPipe(createTicketValidation)) body: CreateTicketRequest,
        @Req() req : Request
    ) : Promise<Ticket> {
        return this.ticketsService.createTicket(body, req)
    }

    @Patch(':id')
    updateTicket(
        @Param(new JoiValidationPipe(ticketIdValidation)) params : TicketId,
        @Body(new JoiValidationPipe(updateTicketValidation)) body : UpdateTicketRequest
    ) : Promise<Ticket> {
        return this.ticketsService.updateTicket(params, body)
    }

    @Delete(':id')
    @UsePipes(new JoiValidationPipe(ticketIdValidation))
    deleteTicket(@Param() params: TicketId) : Promise<DeleteResult> {
        return this.ticketsService.deleteTicket(params)
    }
}