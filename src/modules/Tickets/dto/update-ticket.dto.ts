import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { QuantityOperation } from "../enum/quantity-operation.enum";

export class UpdateTicketDto {
    @IsUUID()
    ticketId!: string;

    @IsOptional()
    @IsString()
    ticketType?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    unitPrice?: number;

    @IsOptional()
    @IsInt()
    quantity?: number;

    @IsOptional()
    @IsEnum(QuantityOperation)
    quantityOperation?: QuantityOperation;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    ticketImage?: string;
};