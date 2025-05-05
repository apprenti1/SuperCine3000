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
import { ListingReturn } from "src/common/interfaces/listing-return.interface";
import { MoneyTransaction } from "./transaction.entity";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { number, string } from "joi";
import { TransactionTypes } from "src/common/enums/transactions-type.enum";

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly transactionsService: TransactionsService
    ) {}

    @Get()
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste toutes les transactions."})
    @ApiQuery({name: "type", description: "Filtre les transactions par leur type.", example: TransactionTypes.deposit, type: string, required: false})
    @ApiQuery({name: "maxAmount", description: "Retire les transactions dont le montant est supérieur à celui donné.", example: 99, minimum: 0, type: number, required: false})
    @ApiQuery({name: "minAmount", description: "Retire les transactions dont le montant est inférieur à celui donné.", example: 14, minimum: 0, type: number, required: false})
    @ApiQuery({name: "amount", description: "Filtre les transactions par leur montant.", example: 25, minimum: 0, type: number, required: false})
    @ApiQuery({name: "userId", description: "Filtre les transactions par l'ID de leur auteur.", example: 1, minimum: 1, type: number, required: false})
    @ApiQuery({name: "username", description: "Filtre les transactions par le nom de leur auteur.", example: "michel", type: string, required: false})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(listTransactionsValidation))
    listTransactions(@Query() queryParams : ListTransactionsRequest) : Promise<ListingReturn<MoneyTransaction>> {
        return this.transactionsService.listTransactions(queryParams)
    }

    // TODO: Voir s'il faut pas plutôt créer un module "/me"
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({summary: "Liste toutes les transactions de l'utilisateur connecté."})
    @ApiQuery({name: "type", description: "Filtre les transactions par leur type.", example: TransactionTypes.deposit, type: string, required: false})
    @ApiQuery({name: "maxAmount", description: "Retire les transactions dont le montant est supérieur à celui donné.", example: 99, minimum: 0, type: number, required: false})
    @ApiQuery({name: "minAmount", description: "Retire les transactions dont le montant est inférieur à celui donné.", example: 14, minimum: 0, type: number, required: false})
    @ApiQuery({name: "amount", description: "Filtre les transactions par leur montant.", example: 25, minimum: 0, type: number, required: false})
    listUserTransactions(@Query(new JoiValidationPipe(listTransactionsValidation)) queryParams : ListTransactionsRequest, @Req() req : Request) {
        // We use the filters to get current user's transactions
        queryParams.userId = req['user'].sub
        queryParams.username = req['user'].username

        return this.transactionsService.listTransactions(queryParams)
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Crée une nouvelle transaction avec les informations données.",
        description: "Si ni 'userId' ni 'username' n'est donné, crée la transaction pour l'utilisateur connecté. Par ailleurs, seul l'admin peut créer une transaction pour quelqu'un."
    })
    createTransaction(@Body(new JoiValidationPipe(createTransactionValidation)) body: CreateTransactionRequest, @Req() req : Request) {
        return this.transactionsService.createTransaction(body, req)
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente une transaction d'ID donnée."})
    @ApiParam({name: 'id', description: "ID de la transaction à présenter", example: 1, type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(transactionIdValidation))
    getTransaction(@Param() params : TransactionId) {
        return this.transactionsService.getTransaction(params)
    }

    @Get('me/:id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Présente une transaction d'ID donnée si elle appartient à l'utilisateur connecté."})
    @ApiParam({name: 'id', description: "ID de la transaction à présenter", example: 1, type: number})
    getMyTransaction(
        @Param(new JoiValidationPipe(transactionIdValidation)) params : TransactionId,
        @Req() req : Request
    ){
        return this.transactionsService.getMyTransaction(params, req)
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Supprime une transaction d'ID donnée."})
    @ApiParam({name: 'id', description: "ID de la transaction à supprimer", example: 1, type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(transactionIdValidation))
    deleteTransaction(@Param() params : TransactionId) {
        return this.transactionsService.deleteTransaction(params)
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({summary: "Modifie une transaction d'ID donnée avec les informations données."})
    @ApiParam({name: 'id', description: "ID de la transaction à modifier", example: 1, type: number})
    @SetRoles(Roles.admin)
    patchTransaction(
        @Param(new JoiValidationPipe(transactionIdValidation)) params : TransactionId,
        @Body(new JoiValidationPipe(patchTransactionValidation)) body : PatchTransactionRequest
    ) {
        return this.transactionsService.patchTransaction(params, body)
    }
}