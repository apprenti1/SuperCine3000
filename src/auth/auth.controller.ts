import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, loginValidation } from './validation/login.schema';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';
import { RefreshRequest, refreshValidation } from './validation/refresh.schema';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @ApiOperation({summary:"Génère un nouvel access-token et un nouveau refresh token pour l'utilisateur donné."})
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginValidation))
    @Public()
    login(@Body() userInfo: LoginRequest) {
        return this.authService.login(userInfo)
    }

    @Delete('logout')
    @ApiOperation({summary:"Invalide les tokens de l'utilisateur connecté."})
    @ApiBearerAuth()
    logout(@Req() req: Request){
        return this.authService.logout(req)
    }

    @Post('refresh')
    @ApiOperation({summary:"Génère un nouvel access-token et éventuellement un nouveau refresh-token pour l'utilisateur correspondant au refresh-token donné."})
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(refreshValidation))
    @Public()
    refresh(@Body() refreshRequest : RefreshRequest){
        return this.authService.refresh(refreshRequest)
    }
}
