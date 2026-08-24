import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventStatus } from "../../enum/event-status.enum";
import { eventListResponse } from "../../helpers/event-response-payload.helper";
import { Event } from "../../entities/events.entity";
import { NearbyEventDto } from "../../dto/nearby-event-query.dto";

export class NearByEventsQueryService{
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
    ){}

    async getNearbyEvents(dto: NearbyEventDto){
        //convert dto radius from km to meters
        const radiusInMeter = (dto.radiusKm ?? 10) * 1000;

        const query = this.eventRepository.createQueryBuilder('event')
        .where('event.eventStatus = :status', {status: EventStatus.PUBLISHED})
        .andWhere(`ST_DWithin(event.eventLocation, ST_SetSRID(ST_MakePoint
            (:longitude, :latitude), 4326)::geography, :radius)`,
        {
            longitude: dto.longitude,
            latitude: dto.latitude,
            radius: radiusInMeter,

        });

        query.addSelect(`ST_Distance(event.eventLocation, ST_SetSRID(
            ST_MakePoint(:longitude, :latitude), 4326)::geography)`,
            'distance',
        )
        .orderBy('distance', 'ASC');

        const {entities, raw} = await query.getRawAndEntities();

        return entities.map((event, index) => ({
            ...eventListResponse(event),
            distanceKm: Number((Number(raw[index].distance) / 1000).toFixed(2)), //convert back to km. 
        }));
    };
};