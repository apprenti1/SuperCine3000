import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class UpdateUserRequest {
    @ApiProperty({
        example: 'michel',
        required: false
    })
    username?: string

    @ApiProperty({
        example: 'michel@super.com',
        required: false
    })
    email?: string
}

export const updateUserValidation = Joi.object<UpdateUserRequest>({
    username: Joi.string().min(3),
    email: Joi.string().email()
}).options({abortEarly: false})