import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UsePipes } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { SetRoles } from "src/auth/decorators/setRoles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { Request } from "express";
import { TransactionId, transactionIdValidation } from "./validation/transaction-id.schema";
import { JoiValidationPipe } from "src/common/pipes/JoiValidationPipe";
import { listTransactionsValidation } from "./validation/list-transactions.schema";
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
    listTransactions(@Query() queryParams) {
        return this.transactionsService.listTransactions(queryParams)
    }

    // TODO: Voir s'il faut pas plutôt créer un module "/me"
    @Get('me')
    listUserTransactions(@Query(new JoiValidationPipe(listTransactionsValidation)) queryParams, @Req() req : Request) {
        return this.transactionsService.listUserTransactions(queryParams, req['user'].sub)
    }

    @Post()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(createTransactionValidation))
    createTransaction(@Body() body: CreateTransactionRequest) {
        return this.transactionsService.createTransaction(body)
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