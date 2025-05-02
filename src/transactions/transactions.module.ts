import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoneyTransaction } from "./transaction.entity";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
    imports: [TypeOrmModule.forFeature([MoneyTransaction])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService]
})
export class TransactionsModule {}