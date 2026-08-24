import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { EventCategory } from '../enum/event-category.enum';
import { PaginationQueryDto } from '@/shared/dto/pagination-query.dto';

export class EventQueryDto extends PaginationQueryDto{
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  venue?: string;
};