import { Ticket } from '../entities/ticket.entity';
import { UpdateTicketDto } from '../dto/update-ticket.dto';

export function updateTicketFields(ticket: Ticket, dto: UpdateTicketDto): Ticket {
    if (dto.ticketType !== undefined) {
        ticket.ticketType = dto.ticketType;
    };

    if (dto.unitPrice !== undefined) {
        ticket.unitPrice = dto.unitPrice;
    };

    if (dto.ticketImage !== undefined) {
        ticket.ticketImage = dto.ticketImage;
    };

    return ticket;
};