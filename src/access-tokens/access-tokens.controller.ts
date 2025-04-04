import { Controller, Delete, Get, Param, Query, UsePipes } from '@nestjs/common';
import { AccessTokensService } from './access-tokens.service';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { AccessTokenId, accessTokenIdValidation } from './validation/access-token-id.schema';
import { ListAccessTokensParams, listAccessTokensValidation } from './validation/list-access-tokens.schema';
import { PaginationRequest } from 'src/common/validation/PaginationRequest';
import { SetRoles } from 'src/auth/decorators/setRoles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@Controller('access-tokens')
export class AccessTokensController {
    constructor(
        private readonly accessTokensService: AccessTokensService
    ) {}

    @Get()
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(listAccessTokensValidation))
    listTokens(@Query() queryParams: ListAccessTokensParams & PaginationRequest) {
        return this.accessTokensService.getTokens(queryParams)
    }

    @Get(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(accessTokenIdValidation))
    getToken(@Param() reqParams: AccessTokenId) {
        return this.accessTokensService.getTokenById(reqParams.id)
    }

    @Delete(':id')
    @SetRoles(Roles.admin)
    @UsePipes(new JoiValidationPipe(accessTokenIdValidation))
    invalidateToken(@Param() reqParams: AccessTokenId) {
        return this.accessTokensService.deleteToken(reqParams.id)
    }
}
