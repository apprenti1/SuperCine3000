import { Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, loginValidation } from './validation/login.schema';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new JoiValidationPipe(loginValidation))
    login(userInfo: LoginRequest) {
        return this.authService.login(userInfo)
    }
}
