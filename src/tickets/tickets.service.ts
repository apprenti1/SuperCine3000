import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "./ticket.entity";
import { DeleteResult, Repository } from "typeorm";
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { ListTicketsParams } from "./validation/list-ticket.schema";
import { PaginationRequest } from "src/common/validation/PaginationRequest";
import { TicketId } from "./validation/ticket-id.schema";
import { CreateTicketRequest } from "./validation/create-ticket.schema";
import { Request } from "express";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { UpdateTicketRequest } from "./validation/update-ticket.schema";
import { TicketTypes } from "src/common/enums/tickets-type.enum";
import { CLASSIC_TICKET_PRICE, SUPER_TICKET_PRICE } from "src/common/constants";
import { ScreeningsService } from "src/screenings/screening.service";
import { Screening } from "src/screenings/screening.entity";
import { Roles } from "src/common/enums/roles.enum";
import { TransactionsService } from "src/transactions/transactions.service";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

@Injectable()
export class TicketsService{
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository : Repository<Ticket>,
        private readonly usersService : UsersService,
        @Inject(forwardRef(() => ScreeningsService))
        private readonly screeningsService: ScreeningsService,
        private readonly transactionsService: TransactionsService
    ) {}

    async listTickets(queryParams: ListTicketsParams & PaginationRequest) : Promise<ListingReturn<Ticket>> {
        const query = this.ticketsRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.screenings', 'screenings')
            .leftJoinAndSelect('ticket.user', 'user')

        if(queryParams.type !== undefined)
            query.andWhere('ticket.type = :type', {type: queryParams.type})

        if(queryParams.ownerId !== undefined)
            query.andWhere('user.id = :id', {id: queryParams.ownerId})

        if(queryParams.ownerName !== undefined)
            query.andWhere('user.username = :name', {name: queryParams.ownerName})

        if(queryParams.screeningId !== undefined)
            query.andWhere('screenings.id = :id', {id: queryParams.screeningId})

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [tickets, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: tickets,
            meta: {
                totalPages: totalPages,
                total: total,
                page: queryParams.page,
                limit: queryParams.limit
            }
        }
    }

    async getTicket(params: TicketId) : Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({where: {id: params.id}, relations: ['user', 'screenings']})
        if(ticket === null)
            throw new NotFoundException('Ticket not found.')

        return ticket
    }

    async createTicket(body: CreateTicketRequest, req: Request) : Promise<Ticket> {
        let screening : Screening | null = null
        if(body.screeningId !== undefined){
            screening = await this.screeningsService.getScreening({id: body.screeningId})
            if(screening.isFull())
                throw new ConflictException('Requested screening is full.')
        }

        let user : User | null = null
        // Only an admin user can buy a ticket for another user
        if(body.userId !== undefined && req['user'].role === Roles.admin){
            user = await this.usersService.findById(body.userId)
            if(user === null)
                throw new NotFoundException("User not found.")
        }

        if(body.username !== undefined && req['user'].role === Roles.admin){
            user = await this.usersService.findByUsername(body.username)
            if(user === null)
                throw new NotFoundException("User not found.")
        }

        // If neither userId nor username have been set
        if(user === null){
            user = await this.usersService.findById(req['user'].sub)
            if(user === null)
                throw new NotFoundException('User not found.')
        }

        // We check if the user has anough money
        const ticketPrice = body.type === TicketTypes.classic ? CLASSIC_TICKET_PRICE : SUPER_TICKET_PRICE
        if(user.wallet < ticketPrice)
            throw new ConflictException("User does not have enough money to pay the ticket.")
        this.transactionsService.newTransaction(ticketPrice, TransactionTypes.payment, user.id)

        let ticket = this.ticketsRepository.create({
            type: body.type,
            user: user,
            screenings: screening === null ? [] : [screening]
        })
        ticket = await this.ticketsRepository.save(ticket)

        return ticket
    }

    async updateTicket(params: TicketId, body: UpdateTicketRequest) : Promise<Ticket> {
        let ticket = await this.ticketsRepository.findOne({where: {id: params.id}, relations: ['user', 'screenings']})

        if(ticket === null)
            throw new NotFoundException('Ticket not found.')

        let newUser : User | null = null
        if(body.userId !== undefined && body.userId !== ticket.user.id){
            newUser = await this.usersService.findById(body.userId)
            if(newUser === null)
                throw new NotFoundException('User not found.')
        }

        if(body.username !== undefined && body.username !== ticket.user.username){
            newUser = await this.usersService.findByUsername(body.username)
            if(newUser === null)
                throw new NotFoundException('User not found.')
        }

        if(newUser !== null){
            const ticketPrice = ticket.type === TicketTypes.classic ? CLASSIC_TICKET_PRICE : SUPER_TICKET_PRICE
            if(newUser.wallet < ticketPrice)
                throw new ConflictException("Impossible to change the user : the new user can't pay the ticket.")

            await this.transactionsService.newTransaction(ticketPrice, TransactionTypes.payment, newUser.id)
            await this.transactionsService.newTransaction(ticketPrice, TransactionTypes.refund, ticket.user.id)
        }

        const user = newUser === null ? ticket.user : newUser

        if(body.type !== undefined && body.type !== ticket.type){
            if(ticket.type === TicketTypes.super && ticket.screenings.length > 1)
                throw new ConflictException("Le ticket super est déjà utilisé plus d'une fois, il ne peut pas devenir classique.")

            const amountToPay = body.type === TicketTypes.super ?
                SUPER_TICKET_PRICE - CLASSIC_TICKET_PRICE
                : CLASSIC_TICKET_PRICE - SUPER_TICKET_PRICE

            if(user.wallet < amountToPay)
                throw new ConflictException("User does not have enough money to pay the ticket change.")

            //user.wallet -= amountToPay
            if(amountToPay < 0)
                await this.transactionsService.newTransaction(-amountToPay, TransactionTypes.refund, user.id)
            else
                await this.transactionsService.newTransaction(amountToPay,  TransactionTypes.payment, user.id)

            ticket.type = body.type
        }

        ticket.user = await this.usersService.saveUser(user)
        ticket = await this.ticketsRepository.save(ticket)

        return ticket
    }

    async addScreening(screening: Screening, ticket: Ticket) : Promise<Ticket> {
        console.log((ticket.type === TicketTypes.super && ticket.screenings.length < 10))
        if((ticket.type === TicketTypes.classic && ticket.screenings.length > 0)
            || (ticket.type === TicketTypes.super && ticket.screenings.length > 9))
            throw new ConflictException("Ticket is already used.")

        ticket.screenings.push(screening)
        let savedTicket = await this.ticketsRepository.save(ticket)
        return savedTicket
    }

    async deleteTicket(params: TicketId) : Promise<DeleteResult> {
        const deletedTicket = await this.ticketsRepository.delete(params.id)
        if(deletedTicket.affected === 0)
            throw new NotFoundException('Ticket not found.')

        return deletedTicket
    }

    async getTicketsByUserId(userId: number) : Promise<Ticket[]> {
        const tickets = await this.ticketsRepository.createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.screenings', 'screening')
            .where(
                `(ticket.type = '${TicketTypes.classic}' AND screening.id IS NULL) OR
                (ticket.type = '${TicketTypes.super}')`
            )
            .andWhere("ticket.userId = :id", {id: userId})
            .groupBy('ticket.id').addGroupBy('screening.id')
            .having(`(ticket.type = '${TicketTypes.classic}' AND COUNT(screening.id) = 0) OR (ticket.type = '${TicketTypes.super}' AND COUNT(screening.id) < 10)`)
            .getMany()

        return tickets
    }
}