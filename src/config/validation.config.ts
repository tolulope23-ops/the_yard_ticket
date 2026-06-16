import { BadRequestException, ValidationPipe } from "@nestjs/common";

export const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,  //throw an error instead of just silently removing an extra property.
    forbidUnknownValues: true, //server send 400, when a request is not aligning with the dto, instead of trying to validate it.
    
    exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints ?? {},)
        }))

        return new BadRequestException({
            message: 'Validation failed',
            errors: formattedErrors 
        })
    },

    transformOptions: {
        enableImplicitConversion: true, //this is based on ts type already computed in the dto or code.
    },

    validationError: {
        target: false,
        value: false,
    },
    stopAtFirstError: false
});