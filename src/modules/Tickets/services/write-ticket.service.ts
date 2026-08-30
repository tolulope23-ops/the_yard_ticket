import { UpdateEventDto } from "@/modules/events/dto/update-event.dto";
import { DataSource, EntityManager } from "typeorm";
import { CreateTicketDto } from "../dto/create-ticket.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Ticket } from "../entities/ticket.entity";
import { UpdateTicketDto } from "../dto/update-ticket.dto";
import { updateTicketFields } from "../helpers/update-ticket-fields.helper";

@Injectable()
export class WriteTicketService{
    constructor(
        private readonly dataSource: DataSource,
    ){}

    async createEventTicket(eventId: string, dto: CreateTicketDto, manager: EntityManager){
        const existingTicket = await manager.findOne(
            Ticket, {
            where: {
                eventId,
                ticketType: dto.ticketType
            }
        })

        if (existingTicket) {
            throw new BadRequestException(
                'A ticket with this type already exists for this event',
            );
        };

        const ticket = manager.create(Ticket, {
            eventId,
            ticketType: dto.ticketType,
            unitPrice: dto.unitPrice,
            quantity: dto.quantity,
            quantitySold: 0,
            quantityAvailable: dto.quantity,
            ticketImage: dto.ticketImage,
        });

        return manager.save(Ticket, ticket);
    };

    async updateEventTicket(eventId: string, dto: UpdateTicketDto, manager: EntityManager) {
        //Check if ticket exist using ticket type and setting pessimistic write lock on the table for consistent data.
        const ticket = await manager
        .getRepository(Ticket)
        .createQueryBuilder('ticket')
        .setLock('pessimistic_write')
        .where('ticket.id = :ticketId', {ticketId: dto.ticketId})
        .andWhere('ticket.eventId = :eventId', {eventId})
        .getOne()

        if (!ticket) {
            throw new NotFoundException(
                `Ticket type ${dto.ticketType} not available for this event`,
            );
        };

        //if ticket type is different, check if its already existing.
        if (dto.ticketType !== undefined && dto.ticketType !== ticket.ticketType) {
            const existingTicket =
                await manager.findOne(Ticket, {
                    where: {
                        eventId,
                        ticketType: dto.ticketType,
                    },
                });

            if (existingTicket) {
                throw new BadRequestException(
                    `A ${dto.ticketType} ticket already exists for this event`,
                );
            };

            ticket.ticketType = dto.ticketType!
        };

        if (dto.quantity !== undefined) {
            ticket.quantity += dto.quantity;
            ticket.quantityAvailable = ticket.quantity - ticket.quantitySold;
        };

        updateTicketFields(ticket, dto)

        return manager.save(Ticket, ticket);
    };
};