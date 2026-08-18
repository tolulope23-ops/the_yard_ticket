import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory } from '../enum/event-category.enum';
import { CreateTicketDto } from '@/modules/Tickets/dto/create-ticket.dto';


export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(EventCategory)
  eventCategory!: EventCategory;

  @IsISO8601()
  eventStartTime!: string;

  @IsISO8601()
  eventEndTime!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  eventVenue!: string;

  @IsString()
  @IsNotEmpty()
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
  @ValidateNested({ each: true })
  @Type(() => CreateTicketDto)
  tickets!: CreateTicketDto[];
};