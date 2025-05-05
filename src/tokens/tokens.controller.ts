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

@Controller('tokens')
export class TokensController {
    constructor(
        private readonly tokensService: TokensService
    ) {}

    @Get()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(listTokensValidation))
    listTokens(@Query() queryParams: ListTokensParams & PaginationRequest) : Promise<ListingReturn<Token>> {
        return this.tokensService.getTokens(queryParams)
    }

    @Get(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(tokenIdValidation))
    getToken(@Param() reqParams: TokenId) {
        return this.tokensService.getTokenById(reqParams.id)
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(tokenIdValidation))
    invalidateToken(@Param() reqParams: TokenId) {
        return this.tokensService.deleteToken(reqParams.id)
    }
}
