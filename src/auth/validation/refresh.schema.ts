import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class RefreshRequest {
    @ApiProperty({
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlhdCI6MTc0NjQ0NTA2NCwiZXhwIjoxNzQ2ODc3MDY0fQ.fdq4gZJlmVDjAoDVs9M4tnN9T-LsYaLQycTjNClWrl4',
        required: true
    })
    refresh_token: string
}

export const refreshValidation = Joi.object<RefreshRequest>({
    refresh_token: Joi.string().min(100).required()
})