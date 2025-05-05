import { Controller, Delete, Get, Param, Query, UsePipes } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { TokenId, tokenIdValidation } from './validation/token-id.schema';
import { ListTokensParams, listTokensValidation } from './validation/list-tokens.schema';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { SetRoles } from 'src/auth/decorators/setRoles.decorator';
import { Roles } from 'src/common/enums/roles.enum';
import { ListingReturn } from 'src/common/interfaces/listing-return.interface';
import { Token } from './token.entity';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { number, string } from 'joi';
import { TokensType } from 'src/common/enums/tokens-type.enum';

@Controller('tokens')
@ApiBearerAuth()
export class TokensController {
    constructor(
        private readonly tokensService: TokensService
    ) {}

    @Get()
    @ApiOperation({summary: "Liste tous les tokens enregistrés."})
    @ApiQuery({name: "ownerUsername", description: "Filtre les tokens selon le nom de leur propriétaire.", example: "michel", type: string})
    @ApiQuery({name: "ownerEmail", description: "Filtre les tokens selon l'email de leur propriétaire.", example: "michel@toto.com", type: string})
    @ApiQuery({name: "ownerId", description: "Filtre les tokens selon l'ID de leur propriétaire.", minimum: 1, example: 3, type: number})
    @ApiQuery({name: "type", description: "Filtre les tokens selon leur type. Valeurs possibles : access, refresh", example: TokensType.access, type: string})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(listTokensValidation))
    listTokens(@Query() queryParams: ListTokensParams & PaginationRequest) : Promise<ListingReturn<Token>> {
        return this.tokensService.getTokens(queryParams)
    }

    @Get(':id')
    @ApiOperation({summary: "Présente le token d'ID donné."})
    @ApiParam({name: 'id', description: "ID du token à présenter", example: 1, type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(tokenIdValidation))
    getToken(@Param() reqParams: TokenId) {
        return this.tokensService.getTokenById(reqParams.id)
    }

    @Delete(':id')
    @ApiOperation({summary: "Supprime et invalide le token d'ID donné."})
    @ApiParam({name: 'id', description: "ID du token à supprimer", example: 1, type: number})
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(tokenIdValidation))
    invalidateToken(@Param() reqParams: TokenId) {
        return this.tokensService.deleteToken(reqParams.id)
    }
}
