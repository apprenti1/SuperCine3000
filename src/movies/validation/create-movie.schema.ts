import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class CreateMovieRequest{
    @ApiProperty({
        example: "Interstellar",
        required: true
    })
    title: string

    @ApiProperty({
        example: "Christopher Nolan",
        required: true
    })
    director: string

    @ApiProperty({
        example: "Science-fiction",
        required: true
    })
    genre: string

    @ApiProperty({
        example: "2h49",
        required: true
    })
    duration: string
}

export const createMovieValidation = Joi.object<CreateMovieRequest>({
    title: Joi.string().min(1).max(100).required(),
    director: Joi.string().min(2).max(100).required(),
    genre: Joi.string().min(3).max(50).required(),
    duration: Joi.string().min(2).max(50).required()
}).options({abortEarly: false})