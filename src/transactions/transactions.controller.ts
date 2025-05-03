import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UsePipes } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { Request } from "express";
import { TransactionId, transactionIdValidation } from "./validation/transaction-id.schema";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { ListTransactionsRequest, listTransactionsValidation } from "./validation/list-transactions.schema";
import { CreateTransactionRequest, createTransactionValidation } from "./validation/create-transaction.schema";
import { PatchTransactionRequest, patchTransactionValidation } from "./validation/patch-transaction.schema";

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService
    ) {}

    @Get()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(listTransactionsValidation))
    listTransactions(@Query() queryParams : ListTransactionsRequest) {
        return this.transactionsService.listTransactions(queryParams)
    }

    // TODO: Voir s'il faut pas plutôt créer un module "/me"
    @Get('me')
    listUserTransactions(@Query(new JoiValidationPipe(listTransactionsValidation)) queryParams : ListTransactionsRequest, @Req() req : Request) {
        // We use the filters to get current user's transactions
        queryParams.userId = req['user'].sub
        queryParams.username = req['user'].username

        return this.transactionsService.listTransactions(queryParams)
    }

    @Post()
    @SetRoles(Roles.admin)
    @UsePipes()
    createTransaction(@Body(new JoiValidationPipe(createTransactionValidation)) body: CreateTransactionRequest, @Req() req : Request) {
        return this.transactionsService.createTransaction(body, req['user'].sub)
    }

    @Get(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(transactionIdValidation))
    getTransaction(@Param() params : TransactionId) {
        return this.transactionsService.getTransaction(params)
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(transactionIdValidation))
    deleteTransaction(@Param() params : TransactionId) {
        return this.transactionsService.deleteTransaction(params)
    }

    @Patch(':id')
    @SetRoles(Roles.admin)
    patchTransaction(
        @Param(new JoiValidationPipe(transactionIdValidation)) params : TransactionId,
        @Body(new JoiValidationPipe(patchTransactionValidation)) body : PatchTransactionRequest
    ) {
        return this.transactionsService.patchTransaction(params, body)
    }
}