import { Controller, Delete, Get, Param, Query, UsePipes } from '@nestjs/common';
import { AccessTokensService } from './access-tokens.service';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { AccessTokenId, accessTokenIdValidation } from './validation/access-token-id.schema';
import { ListAccessTokensParams, listAccessTokensValidation } from './validation/list-access-tokens.schema';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';

@Controller('access-tokens')
export class AccessTokensController {
    constructor(
        private readonly accessTokensService: AccessTokensService
    ) {}

    @Get()
    @UsePipes(new JoiValidationPipe(listAccessTokensValidation))
    listTokens(@Query() queryParams: ListAccessTokensParams & PaginationRequest) {
        return this.accessTokensService.getTokens(queryParams)
    }

    @Get(':id')
    @UsePipes(new JoiValidationPipe(accessTokenIdValidation))
    getToken(@Param() reqParams: AccessTokenId) {
        return this.accessTokensService.getTokenById(reqParams.id)
    }

    @Delete(':id')
    @UsePipes(new JoiValidationPipe(accessTokenIdValidation))
    invalidateToken(@Param() reqParams: AccessTokenId) {
        return this.accessTokensService.deleteToken(reqParams.id)
    }
}
