import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { EventCategory } from '../enum/event-category.enum';
import { UpdateTicketDto } from '@/modules/tickets/dto/update-ticket.dto';

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    description?: string;

    @IsOptional()
    @IsEnum(EventCategory)
    eventCategory?: EventCategory;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    eventBannerImage?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        {message: 'eventDate must be in YYYY-MM-DD format'},
    )
    eventDate!: string;

    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/,{message: 'eventStartTime must be in HH:mm format'})
    eventStartTime!: string;

    @IsString()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {message: 'eventEndTime must be in HH:mm format'})
    eventEndTime?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    eventVenue?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    address?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateTicketDto)
    tickets?: UpdateTicketDto[];
};