import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoneyTransaction } from "./transaction.entity";
import { Repository } from "typeorm"
import { PatchTransactionRequest } from "./validation/patch-transaction.schema";
import { TransactionId } from "./validation/transaction-id.schema";
import { CreateTransactionRequest } from "./validation/create-transaction.schema";
import { ListTransactionsParam } from "./validation/list-transactions.schema";

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(MoneyTransaction)
        private transactionsRepository : Repository<MoneyTransaction>
    ) {}

    async listTransactions(queryParams : ListTransactionsParam) {
        return 'wip'
    }

    async listUserTransactions(queryParams : ListTransactionsParam, userId : number) {
        return 'wip'
    }

    async createTransaction(body : CreateTransactionRequest) {
        return 'wip'
    }

    async getTransaction(params : TransactionId){
        return 'wip'
    }

    async deleteTransaction(params : TransactionId){
        return 'wip'
    }

    async patchTransaction(params : TransactionId, body : PatchTransactionRequest){
        return 'wip'
    }
}