import { ArgumentMetadata, BadRequestException, InternalServerErrorException, PipeTransform } from "@nestjs/common";
import { isError, ObjectSchema } from "joi";
import { generateValidationErrorMessage } from "../validation/generate-validation-message";

export class JoiValidationPipe implements PipeTransform{
    constructor(private schema: ObjectSchema) {}

    async transform(value: any, metadata: ArgumentMetadata) {
        try {
            const validated = await this.schema.validateAsync(value)
            return validated
        } catch (error) {
            if(isError(error))
                throw new BadRequestException(generateValidationErrorMessage(error.details))
            else
                throw new InternalServerErrorException()
        }
    }
}