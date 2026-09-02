import {IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from "class-validator";

export class CreateTicketDto {
    @IsString()
    ticketType!: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unitPrice!: number;
     
    @IsInt()
    @Min(1)
    quantity!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    ticketImage?: string;
};