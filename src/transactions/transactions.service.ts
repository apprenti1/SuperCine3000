import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoneyTransaction } from "./transaction.entity";
import { DeleteResult, Repository } from "typeorm"
import { PatchTransactionRequest } from "./validation/patch-transaction.schema";
import { TransactionId } from "./validation/transaction-id.schema";
import { CreateTransactionRequest } from "./validation/create-transaction.schema";
import { ListTransactionsRequest } from "./validation/list-transactions.schema";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";
import { Request } from "express";
import { Roles } from "src/common/enums/roles.enum";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(MoneyTransaction)
        private transactionsRepository : Repository<MoneyTransaction>,
        private readonly usersService : UsersService
    ) {}

    async listTransactions(queryParams : ListTransactionsRequest) {
        const query = this.transactionsRepository.createQueryBuilder('transac')

        // Applying filters

        if(queryParams.type !== undefined)
            query.andWhere('transac.type = :type', {type: queryParams.type})

        if(queryParams.amount)
            query.andWhere('transac.amount = :amount', {amount: queryParams.amount})

        if(queryParams.minAmount)
            query.andWhere('transac.amount >= :minAmount', {minAmount: queryParams.minAmount})

        if(queryParams.maxAmount)
            query.andWhere('transac.amount <= :maxAmount', {maxAmount: queryParams.maxAmount})

        if(queryParams.userId)
            query.andWhere('transac.userId = :id', {id: queryParams.userId})

        if(queryParams.username){
            query.leftJoin('transac.user', 'user')
            query.andWhere('user.username = :username', {username: queryParams.username})
        }

        // Applying pagination

        query.skip((queryParams.page - 1) * queryParams.limit)
        query.take(queryParams.limit)

        const [transactions, total] = await query.getManyAndCount()
        const totalPages = Math.ceil(total / queryParams.limit)

        return {
            data: transactions,
            page_size: queryParams.limit,
            page: queryParams.page,
            total_entities: total,
            total_pages: totalPages
        }
    }

    async createTransaction(body : CreateTransactionRequest, req: Request) : Promise<MoneyTransaction> {
        let transactionAuthor : User | null = null

        if(req['user'].role === Roles.admin && (body.username || body.userId)){
            if(body.username)
                transactionAuthor = await this.usersService.findByUsername(body.username)
            if(body.userId)
                transactionAuthor = await this.usersService.findById(body.userId)
        } else
            transactionAuthor = await this.usersService.findById(req['user'].sub)

        if(!transactionAuthor)
            throw new NotFoundException('User not found.')

        if(body.type === TransactionTypes.withdrawal && transactionAuthor.wallet < body.amount)
            throw new BadRequestException("Insufficient wallet.")

        // Update the user's wallet
        transactionAuthor.wallet += body.type === TransactionTypes.deposit ? body.amount : -body.amount
        this.usersService.saveUser(transactionAuthor)

        let transaction = this.transactionsRepository.create({
            amount: body.amount,
            type: body.type,
            user: transactionAuthor
        })
        transaction = await this.transactionsRepository.save(transaction)

        return transaction
    }

    async getTransaction(params : TransactionId) : Promise<MoneyTransaction> {
        const transaction = await this.transactionsRepository.findOne({
            where: {id: params.id},
            relations: ['user']
        })
        if(!transaction)
            throw new NotFoundException('Transaction not found')

        return transaction
    }

    async getMyTransaction(params : TransactionId, req: Request) : Promise<MoneyTransaction> {
        const transaction = await this.transactionsRepository.findOne({
            where: {id: params.id},
            relations: ['user']
        })
        if(!transaction)
            throw new NotFoundException('Transaction not found')

        // If the current user is not the author of the transaction
        if(transaction.user.username !== req['user'].username)
            throw new NotFoundException('Transaction not found')

        return transaction
    }

    async deleteTransaction(params : TransactionId) : Promise<DeleteResult> {
        const deletedTransac = await this.transactionsRepository.delete(params.id)
        if(!deletedTransac.affected)
            throw new NotFoundException('Transaction not found')

        return deletedTransac
    }

    async patchTransaction(params : TransactionId, body : PatchTransactionRequest) : Promise<MoneyTransaction> {
        let transaction = await this.transactionsRepository.findOne({where: {id: params.id}, relations: ['user']})
        if(transaction === null)
            throw new NotFoundException("Transaction not found.")

        let transacAuthor = transaction.user

        // If the transaction's author changes
        if(body.userId !== undefined && body.userId !== transacAuthor.id){
            // We get the new author
            const newAuthor = await this.usersService.findById(body.userId)
            if(newAuthor === null)
                throw new NotFoundException('User not found.')

            // First, we cancel the old transaction
            if(transaction.type === TransactionTypes.withdrawal){
                transacAuthor.wallet += transaction.amount
                newAuthor.wallet -= transaction.amount
            }else{
                transacAuthor.wallet -= transaction.amount
                newAuthor.wallet += transaction.amount
            }
            // Then, we save the change and change the author
            transacAuthor = await this.usersService.saveUser(transacAuthor)
            transacAuthor = newAuthor
        }
    
        // If the transaction's amount changes
        if(body.amount !== undefined && body.amount !== transaction.amount){
            if(transaction.type === TransactionTypes.withdrawal)
                transacAuthor.wallet += transaction.amount - body.amount
            else
                transacAuthor.wallet += body.amount - transaction.amount

            transaction.amount = body.amount
        }

        // If the type changes
        if(body.type !== undefined && body.type !== transaction.type){
            if(transaction.type === TransactionTypes.withdrawal)
                transacAuthor.wallet += transaction.amount * 2 // Refund + operation
            else
                transacAuthor.wallet -= transaction.amount * 2 // Correction + operation

            transaction.type = body.type
        }

        transacAuthor = await this.usersService.saveUser(transacAuthor)

        transaction.user = transacAuthor // Very important
        transaction = await this.transactionsRepository.save(transaction)

        return transaction
    }
}