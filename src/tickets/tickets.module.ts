import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ticket } from "./ticket.entity";
import { UsersModule } from "src/users/users.module";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
    imports: [TypeOrmModule.forFeature([Ticket]), UsersModule],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService]
})
export class TicketsModule {}