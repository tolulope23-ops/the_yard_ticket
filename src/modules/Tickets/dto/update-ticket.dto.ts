import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { TicketType } from "../enum/tickets-type.enum";

export class UpdateTicketDto {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsEnum(TicketType)
    ticketType!: TicketType;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unitPrice!: number;

    @IsInt()
    @Min(1)
    quantity!: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    ticketImage?: string;
};