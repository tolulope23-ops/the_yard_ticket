import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Event } from "../../entities/events.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ReadTicketService } from "@/modules/Tickets/services/read-ticket.service";
import { eventDetailsResponse, eventListResponse } from "../../helpers/event-response-payload.helper";
import { EventStatus } from "../../enum/event-status.enum";
import { Ticket } from "@/modules/Tickets/entities/ticket.entity";
import { EventQueryDto } from "../../dto/event-filter-query.dto";
import { createPaginatedResponse } from "@/shared/helper/pagination-response.helper";

@Injectable()
export class ReadEventService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        private readonly readTicketService: ReadTicketService,
    ){}

//Public Facing events
    async getEventDetails(eventId: string){
        const eventDetails = await this.eventRepository.findOne({
            where: {id: eventId}
        })

        if(!eventDetails){
            throw new BadRequestException('Event not available');
        };

        const eventTicketDetails = await this.readTicketService.getEventTickets(eventId);

        return eventDetailsResponse(eventDetails, eventTicketDetails);
    };


    async getAllEvents(dto: EventQueryDto){
        const query = this.eventRepository.createQueryBuilder('event')
        .where('event.eventStatus = :status', {status: EventStatus.PUBLISHED})

        if (dto.category) {
            query.andWhere('event.eventCategory = :category', {category: dto.category});
        };

        if (dto.venue) {
            query.andWhere('event.eventVenue ILIKE :venue', {venue: `%${dto.venue}%`});
        };

        const skip = (dto.page - 1) * dto.limit;
        
        const [events, total] = await query
        .orderBy('event.eventDate', 'ASC')
        .addOrderBy('event.eventStartTime', 'ASC')
        .skip(skip)
        .take(dto.limit)
        .getManyAndCount()

        if (total === 0) {
            throw new NotFoundException('No events available');
        };

        return createPaginatedResponse(
            events.map(eventListResponse),
            dto.page,
            dto.limit,
            total,
        )
    };
    

    //Organiser Facing Events
    async getOrganiserEvents(organiserAccountId: string, dto: EventQueryDto){
        const query = this.eventRepository.createQueryBuilder('event')
        .where('event.organiserAccountId = :id', {id: organiserAccountId})
        .orderBy('eventDate')

        const skip = (dto.page - 1) * dto.limit;
        
        const [events, total] = await query
        .orderBy('event.eventDate', 'ASC')
        .addOrderBy('event.eventStartTime', 'ASC')
        .skip(skip)
        .take(dto.limit)
        .getManyAndCount()

        if (total === 0) {
            throw new NotFoundException('No events available');
        };

        return createPaginatedResponse(
            events.map(eventListResponse),
            dto.page,
            dto.limit,
            total,
        )
    };

    async deleteEvent(eventId: string, organiserAccountId: string){
        return this.dataSource.transaction(async manager => {
            const event = await manager.findOne(Event, {
                where: {
                    id: eventId,
                    organiserAccountId
                }
            });

            if (!event) {
                throw new BadRequestException('Event does not exist');
            };

            await manager.softDelete(Ticket, {eventId: event.id})
            await manager.softDelete(Event, event.id,)
        
            return {message: 'Event successfully deleted'};
        });
    }; 
};