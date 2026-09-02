import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory } from '../enum/event-category.enum';
import { CreateTicketDto } from '@/modules/tickets/dto/create-ticket.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  description!: string;

  @IsEnum(EventCategory)
  eventCategory!: EventCategory;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  eventBannerImage!: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    {message: 'eventDate must be in YYYY-MM-DD format'},
  )
  eventDate!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/,{message: 'eventStartTime must be in HH:mm format'})
  eventStartTime!: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {message: 'eventEndTime must be in HH:mm format'})
  eventEndTime?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  eventVenue!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  address!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketDto)
  tickets!: CreateTicketDto[];
};