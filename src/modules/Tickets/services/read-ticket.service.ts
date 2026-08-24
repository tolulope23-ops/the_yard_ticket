import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "../entities/ticket.entity";
import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ReadTicketService {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>
    ){}

    async getEventTickets(eventId: string){
        const eventTickets = await this.ticketRepository.find({
            where: {eventId}
        });

        if (eventTickets.length === 0) {
            throw new NotFoundException('event tickets not available');
        };

        return eventTickets;
    };

    async getTicketById(ticketId: string) {
        const ticket = await this.ticketRepository.findOne({
            where: {id: ticketId},
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        };

        return ticket;
    };
};