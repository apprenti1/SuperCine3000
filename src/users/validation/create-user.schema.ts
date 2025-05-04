import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class CreateUserRequest {
    @ApiProperty({
        example: 'michel',
        required: true
    })
    username: string

    @ApiProperty({
        example: 'michel@super.com',
        required: true
    })
    email: string

    @ApiProperty({
        example: 'MyGood.Password#123',
        required: true
    })
    password: string

}

export const createUserValidation = Joi.object<CreateUserRequest>({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(8).max(20).required(),
    email: Joi.string().email().required()
}).options({abortEarly: false})