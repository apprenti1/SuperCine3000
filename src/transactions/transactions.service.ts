import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoneyTransaction } from "./transaction.entity";
import { Repository } from "typeorm"

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(MoneyTransaction)
        private transactionsRepository : Repository<MoneyTransaction>
    ) {}
}