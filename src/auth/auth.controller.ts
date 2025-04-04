import { Body, Controller, Delete, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, loginValidation } from './validation/login.schema';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { Public } from './decorators/public.decorator';

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
    logout(){
        return this.authService.logout()
    }

    @Post('refresh')
    refresh(){
        return this.authService.refresh()
    }
}
