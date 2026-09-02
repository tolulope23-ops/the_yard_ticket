import { DataSource, Point } from "typeorm";
import { CreateEventDto } from "../../dto/create-event.dto";
import { Event } from "../../entities/events.entity";
import { WriteTicketService } from "@/modules/tickets/services/write-ticket.service";
import { UpdateEventDto } from "../../dto/update-event.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { updateEventFields } from "../../helpers/update-event-fields.helper";
import { EventStatus } from "../../enum/event-status.enum";
import { Ticket } from "@/modules/tickets/entities/ticket.entity";

export class WriteEventService{
    constructor(
        private readonly dataSource: DataSource,
        private readonly writeTicketService: WriteTicketService,
    ){}

    async createEvent(organiserAccountId: string, dto: CreateEventDto){
        //events location calculated using geojson
        const eventLocation: Point = {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude],
        };

        return this.dataSource.transaction(async manager => {
            const event = manager.create(Event, {
                organiserAccountId,
                title: dto.title,
                description: dto.description,
                eventBannerImage: dto.eventBannerImage,
                eventCategory: dto.eventCategory,
                eventStartTime: dto.eventStartTime,
                eventEndTime: dto.eventEndTime,
                eventVenue: dto.eventVenue,
                eventAddress: dto.address,
                eventStatus: EventStatus.PUBLISHED,
                latitude: String(dto.latitude),
                longitude: String(dto.longitude),
                eventLocation: eventLocation,
            })
            const savedEvent = await manager.save(Event, event);

            //saves event ticket details through event service
            for(const ticketDto of dto.tickets){
                await this.writeTicketService.createEventTicket(savedEvent.id, ticketDto, manager)
            };

            return savedEvent;
        })
    };

    async updateEvent(organiserAccountId: string, eventId: string, dto: UpdateEventDto){
        return this.dataSource.transaction(async manager => {

            //verify the event belongs to the organiser
            const event = await manager.findOne(Event, {
                where: {id: eventId, organiserAccountId}
            });

            if(!event){
                throw new NotFoundException('Event not available');
            };

            //address, lat and long if updated must be provided together
            const isAddressProvided = dto.address !== undefined;

            const isLatitudeProvided = dto.latitude !== undefined;

            const isLongitudeProvided = dto.longitude !== undefined;

            if (isAddressProvided && (!isLatitudeProvided || !isLongitudeProvided)) {
                throw new BadRequestException('Address, latitude and longitude must be provided together');
            };

            if (!isAddressProvided && (isLatitudeProvided || isLongitudeProvided)) {
                throw new BadRequestException('Address must be provided when updating coordinates');
            };

            //updating other event update fields
            updateEventFields(event, dto);

            if (isAddressProvided && isLatitudeProvided && isLongitudeProvided) {
                const eventLocation: Point = {
                    type: 'Point',
                    coordinates: [dto.longitude!, dto.latitude!],
                };

                event.latitude = String(dto.latitude);
                event.longitude = String(dto.longitude);
                event.eventLocation = eventLocation;
            };

            await manager.save(Event, event);

            //Sve ticket 
            if (dto.tickets !== undefined) {
                if (dto.tickets.length === 0) {
                    throw new BadRequestException('At least one ticket is required');
                };

                for (const ticketDto of dto.tickets) {
                    await this.writeTicketService
                    .updateEventTicket(event.id, ticketDto, manager);
                };
            };
        })
    };

    async deleteEvent(organiserAccountId: string, eventId: string) {
        return this.dataSource.transaction(async manager => {

            //Lock the event to prevent concurrent updates/deletions.
            const event = await manager
            .getRepository(Event)
            .createQueryBuilder('event')
            .setLock('pessimistic_write')
            .where('event.id = :eventId', { eventId })
            .andWhere('event.organiserAccountId = :organiserAccountId',{ organiserAccountId })
            .getOne();

            if (!event) {
                throw new NotFoundException('Event not available')
            };

            // Check whether any ticket belonging to this event has ever had a sale.
            const ticketWithSales = await manager
                .getRepository(Ticket)
                .createQueryBuilder('ticket')
                .where('ticket.eventId = :eventId', { eventId })
                .andWhere('ticket.quantitySold > 0')
                .getOne();

            // Event has sales history. Preserve the event and its ticket records.
            if (ticketWithSales) {
                await manager.softRemove(Event, event);

                return {
                    message: 'Event deleted successfully',
                };
            };

            // Event has never had a ticket sale, permanently delete the event and its associated tickets.
            await manager
            .getRepository(Ticket)
            .delete({ eventId });

            await manager.remove(Event, event);

            return {
                message: 'Event deleted successfully',
            };
        });
    };
};