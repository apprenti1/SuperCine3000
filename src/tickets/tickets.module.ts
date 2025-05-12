import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "./ticket.entity";
import { UsersModule } from "src/users/users.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { ScreeningsModule } from "src/screenings/screening.module";
import { TransactionsModule } from "src/transactions/transactions.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket]),
        UsersModule,
        TransactionsModule,
        forwardRef(() => ScreeningsModule)
    ],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService]
})
export class TicketsModule {}