import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from "class-validator";
import { TicketType } from "../enum/tickets-type.enum";

export class CreateTicketDto{
    @IsEnum(TicketType)
    ticketType!: TicketType;

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