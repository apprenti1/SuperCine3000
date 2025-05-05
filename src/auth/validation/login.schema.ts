import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class LoginRequest {
    @ApiProperty({
        example: 'michel',
        required: false,
        description: "Champ requis si 'email' non donné."
    })
    username?: string

    @ApiProperty({
        example: 'michel@ouploup.com',
        required: false,
        description: "Champ requis si 'username' non donné."
    })
    email?: string

    @ApiProperty({
        example: 'MyPassword.123',
        required: true,
    })
    password: string
}

export const loginValidation = Joi.object<LoginRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(20).required()
}).xor('username', 'email').options({abortEarly: false})