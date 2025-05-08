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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { number, string } from "joi";
import { TicketTypes } from "src/common/enums/tickets-type.enum";

@Controller('tickets')
export class TicketsController{
    constructor(
        private readonly ticketsService : TicketsService
    ) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste tous les tickets en filtrant selon les paramètres passés dans l'URL."})
    @ApiQuery({name: "type", description: "Filtre les tickets selon leur type. Peut être 'super' ou 'classic', un super ticket vaut 10 tickets classiques.", example: TicketTypes.super, type: string, required: false})
    @ApiQuery({name: "ownerName", description: "Filtre les tickets par le nom de leur propriétaire.", example: "michel", type: string, required: false})
    @ApiQuery({name: "ownerId", description: "Filtre les tickets par l'ID de leur propriétaire.", example: 1, type: number, required: false})
    @ApiQuery({name: "screeningId", description: "Filtre les tickets par l'ID de la séance à laquelle ils sont liés.", example: 1, type: number, required: false})
    @ApiQuery({name: 'page', required: false, type: number, description: "Définit le numéro de la page à afficher.", minimum: 1})
    @ApiQuery({name: 'limit', required: false, type: number, description: "Définit le nombre de tickets par page.", minimum: 1})
    @UsePipes(new JoiValidationPipe(listTicketsParamsValidation))
    listTickets(@Query() queryParams: ListTicketsParams & PaginationRequest): Promise<ListingReturn<Ticket>> {
        return this.ticketsService.listTickets(queryParams)
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente le ticket d'ID donné."})
    @ApiParam({name: 'id', description: "ID du ticket à présenter.", example: 1, type: number})
    @UsePipes(new JoiValidationPipe(ticketIdValidation))
    getTickets(@Param() params: TicketId) : Promise<Ticket> {
        return this.ticketsService.getTicket(params)
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({summary: "Crée un nouveau ticket avec les informations données.", description: "Le ticket appartiendra au user spécifié en requête; s'il n'y en a pas, à l'utilisateur courant. Seul l'admin peut déclancher l'aquisition d'un billet par un autre utilisateur que lui-même."})
    createTicket(
        @Body(new JoiValidationPipe(createTicketValidation)) body: CreateTicketRequest,
        @Req() req : Request
    ) : Promise<Ticket> {
        return this.ticketsService.createTicket(body, req)
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Modifie le ticket d'ID donné avec les informations données en requête."})
    @ApiParam({name: 'id', description: "ID du ticket à modifier.", example: 1, type: number})
    updateTicket(
        @Param(new JoiValidationPipe(ticketIdValidation)) params : TicketId,
        @Body(new JoiValidationPipe(updateTicketValidation)) body : UpdateTicketRequest
    ) : Promise<Ticket> {
        return this.ticketsService.updateTicket(params, body)
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Supprime le ticket d'ID donné."})
    @ApiParam({name: 'id', description: "ID du ticket à supprimer.", example: 1, type: number})
    @UsePipes(new JoiValidationPipe(ticketIdValidation))
    deleteTicket(@Param() params: TicketId) : Promise<DeleteResult> {
        return this.ticketsService.deleteTicket(params)
    }
}