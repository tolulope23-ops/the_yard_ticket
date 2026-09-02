import { DataSource, EntityManager } from "typeorm";
import { CreateTicketDto } from "../dto/create-ticket.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Ticket } from "../entities/ticket.entity";
import { UpdateTicketDto } from "../dto/update-ticket.dto";
import { updateTicketFields } from "../helpers/update-ticket-fields.helper";
import { QuantityOperation } from "../enum/quantity-operation.enum";
import { Event } from "@/modules/events/entities/events.entity";

@Injectable()
export class WriteTicketService{
    constructor(
        private readonly dataSource: DataSource,
    ){}

    async createEventTicket(eventId: string, dto: CreateTicketDto, manager: EntityManager){
        //format ticket type for name consistency.
        const formatTicketType = dto.ticketType.toLowerCase().trim();

        const existingTicket = await manager.findOne(
            Ticket, {
            where: {
                eventId,
                ticketType: formatTicketType
            }
        });

        if (existingTicket) {
            throw new BadRequestException(
                'A ticket with this type already exists for this event',
            );
        };

        const ticket = manager.create(Ticket, {
            eventId,
            ticketType: formatTicketType,
            unitPrice: dto.unitPrice,
            quantitySold: 0,
            quantity: dto.quantity,
            ticketImage: dto.ticketImage,
        });

        return manager.save(Ticket, ticket);
    };

    async updateEventTicket(eventId: string, dto: UpdateTicketDto, manager: EntityManager) {
        //Check if ticket exist and belongs to event, then set pessimistic write lock on the table for consistent data.
        const ticket = await manager
        .getRepository(Ticket)
        .createQueryBuilder('ticket')
        .setLock('pessimistic_write')
        .where('ticket.id = :ticketId', {ticketId: dto.ticketId})
        .andWhere('ticket.eventId = :eventId', {eventId})
        .getOne()

        if (!ticket) {
            throw new NotFoundException(`Ticket not available for this event`);
        };

        //check if ticket type is already existing.
        if (dto.ticketType !== undefined) {
            //format ticket type for name consistency.
            const formatTicketType = dto.ticketType.toLowerCase().trim();

            if(formatTicketType !== ticket.ticketType) {
                const existingTicket = await manager.findOne(Ticket, {
                        where: {
                            eventId,
                            ticketType: formatTicketType,
                        },
                    });

                if (existingTicket) {
                    throw new BadRequestException(
                        `${formatTicketType} ticket already exists for this event`,
                    );
                };

                ticket.ticketType = formatTicketType;
            };
        };

        if (dto.quantity !== undefined && dto.quantityOperation === undefined) {
            throw new BadRequestException('Invalid quantity operation');
        };

        if (dto.quantity !== undefined) {
            if (dto.quantityOperation === QuantityOperation.ADD) {
                ticket.quantity += dto.quantity;
            };

            if (dto.quantityOperation === QuantityOperation.REMOVE) {
                if (dto.quantity > ticket.quantity) {
                    throw new BadRequestException(
                        `Cannot reduce ticket by ${dto.quantity}. Only ${ticket.quantity} tickets are available.`,
                    );
                };

                ticket.quantity -= dto.quantity;
            };
        };

        updateTicketFields(ticket, dto)

        return manager.save(Ticket, ticket);
    };

    async deleteEventTicket(eventId: string, ticketId: string) {
        return this.dataSource.transaction(async manager => {
            // Lock the event row so concurrent ticket deletions cannot violate the minimum-ticket rule.
            const event = await manager
            .getRepository(Event)
            .createQueryBuilder('event')
            .setLock('pessimistic_write')
            .where('event.id = :eventId', { eventId })
            .getOne();

            if (!event) {
                throw new NotFoundException('Event not available');
            };

            //Find the active ticket belonging to this event.
            const ticket = await manager.findOne(Ticket, {
                where: {
                    id: ticketId,
                    eventId,
                },
            });

            if (!ticket) {
                throw new NotFoundException('Ticket not available for this event')}

            // Count active tickets.
            const activeTicketCount = await manager
            .getRepository(Ticket)
            .createQueryBuilder('ticket')
            .where('ticket.eventId = :eventId', {eventId})
            .getCount();

            // An event must always retain at least one active ticket.
            if (activeTicketCount <= 1) {
                throw new BadRequestException('An event must have at least one ticket');
            };

            // Preserve the ticket if it has sales history.
            if (ticket.quantitySold > 0) {
                await manager.softRemove(Ticket, ticket);

                return {
                    message: 'Ticket deleted successfully',
                };
            };

            // No sales history exists, so permanently remove the ticket.
            await manager.remove(Ticket, ticket);

            return {
                message: 'Ticket deleted successfully',
            };
        });
    }
};