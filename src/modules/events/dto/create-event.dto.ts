import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory } from '../enum/event-category.enum';
import { CreateTicketDto } from '@/modules/Tickets/dto/create-ticket.dto';
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

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  eventDate!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  eventStartTime!: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
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