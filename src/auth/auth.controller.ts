import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, loginValidation } from './validation/login.schema';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginValidation))
    @Public()
    login(@Body() userInfo: LoginRequest) {
        return this.authService.login(userInfo)
    }

    @Delete('logout')
    logout(@Req() req: Request){
        return this.authService.logout(req)
    }

    @Post('refresh')
    refresh(){
        return this.authService.refresh()
    }
}
