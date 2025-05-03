import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoneyTransaction } from "./transaction.entity";
import { Repository } from "typeorm"
import { PatchTransactionRequest } from "./validation/patch-transaction.schema";
import { TransactionId } from "./validation/transaction-id.schema";
import { CreateTransactionRequest } from "./validation/create-transaction.schema";
import { ListTransactionsRequest } from "./validation/list-transactions.schema";
import { User } from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(MoneyTransaction)
        private transactionsRepository : Repository<MoneyTransaction>,
        private readonly usersSercice : UsersService
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

    async createTransaction(body : CreateTransactionRequest, currentUserId: number) : Promise<MoneyTransaction> {
        let transactionAuthor : User | null
        if(body.username)
            transactionAuthor = await this.usersSercice.findByUsername(body.username)
        else
            transactionAuthor = await this.usersSercice.findById(body.userId ? body.userId : currentUserId)

        if(!transactionAuthor)
            throw new NotFoundException('User not found.')

        if(body.type === TransactionTypes.withdrawal && transactionAuthor.wallet < body.amount)
            throw new BadRequestException("Insufficient wallet.")

        // Update the user's wallet
        transactionAuthor.wallet += body.type === TransactionTypes.deposit ? body.amount : -body.amount
        this.usersSercice.saveUser(transactionAuthor)

        // TODO Pas sûr que ça marche ça
        const transaction = this.transactionsRepository.create({
            ...body,
            user: transactionAuthor
        })
        
        return transaction
    }

    async getTransaction(params : TransactionId){
        const transaction = await this.transactionsRepository.findOne({where: {id: params.id}})
        if(!transaction)
            throw new NotFoundException('Transaction not found')

        return transaction
    }

    async deleteTransaction(params : TransactionId){
        const deletedTransac = await this.transactionsRepository.delete(params.id)
        if(!deletedTransac.affected)
            throw new NotFoundException('Transaction not found')

        return deletedTransac
    }

    async patchTransaction(params : TransactionId, body : PatchTransactionRequest){
        return 'wip'
    }
}