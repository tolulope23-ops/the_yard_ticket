import {IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min} from 'class-validator';

import { EventCategory } from '../enum/event-category.enum';
import { IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyEventDto {
    @IsNumber()
    @IsLatitude()
    latitude!: number;

    @IsNumber()
    @IsLongitude()
    longitude!: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    radiusKm?: number = 10;
};