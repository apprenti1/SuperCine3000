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
import { ListingReturn } from "src/common/interfaces/listing-return.interface";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(MoneyTransaction)
        private transactionsRepository : Repository<MoneyTransaction>,
        private readonly usersService : UsersService
    ) {}

    async listTransactions(queryParams : ListTransactionsRequest) : Promise<ListingReturn<MoneyTransaction>> {
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
            meta: {
                limit: queryParams.limit,
                page: queryParams.page,
                total: total,
                totalPages: totalPages
            }
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

        await this.applyTransaction(body.amount, body.type, transactionAuthor)

        const transaction = await this.addTransaction(body.amount, body.type, transactionAuthor)

        return transaction
    }

    async newTransaction(amount: number, type: TransactionTypes, userId: number) : Promise<MoneyTransaction> {
        const user = await this.usersService.findById(userId)
        if(user === null)
            throw new NotFoundException('User not found.')

        console.log(await this.applyTransaction(amount, type, user))
        const transaction = await this.addTransaction(amount, type, user)
        return transaction
    }

    private async applyTransaction(amount: number, type: TransactionTypes, user: User) : Promise<User> {
        if(type === TransactionTypes.withdrawal && user.wallet < amount)
            throw new BadRequestException("Insufficient wallet.")

        // Update the user's wallet
        if(type === TransactionTypes.withdrawal || type === TransactionTypes.payment) 
            user.wallet -= amount
        else
            user.wallet +=amount
        return await this.usersService.saveUser(user)
    }

    private async addTransaction(amount: number, type: TransactionTypes, user: User) : Promise<MoneyTransaction> {
        let transaction = this.transactionsRepository.create({amount, type, user})
        return await this.transactionsRepository.save(transaction)
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