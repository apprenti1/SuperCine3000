import { ApiProperty } from "@nestjs/swagger";
import Joi from "joi";

export class PatchMovieRequest{
    @ApiProperty({
        example: "Interstellar",
        required: true
    })
    title?: string

    @ApiProperty({
        example: "Christopher Nolan",
        required: true
    })
    director?: string

    @ApiProperty({
        example: "Science-fiction",
        required: true
    })
    genre?: string

    @ApiProperty({
        example: "2h49",
        required: true
    })
    duration?: string
}

export const patchMovieValidation = Joi.object<PatchMovieRequest>({
    title: Joi.string().min(1).max(100),
    director: Joi.string().min(2).max(100),
    genre: Joi.string().min(3).max(50),
    duration: Joi.string().min(2).max(50)
}).options({abortEarly: false})