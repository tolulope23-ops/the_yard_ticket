import { Ticket } from "@/modules/tickets/entities/ticket.entity";
import { Event } from "../entities/events.entity";

//Public Facing event responses
export function eventListResponse(event: Event){
    return {
        id: event.id,
        title: event.title,
        eventBannerImage: event.eventBannerImage,
        eventCategory: event.eventCategory,
        eventDate: event.eventDate,
        eventVenue: event.eventVenue,
    };
};

export function eventDetailsResponse(event: Event, tickets: Ticket[]){
    return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventBannerImage: event.eventBannerImage,
        eventCategory: event.eventCategory,
        eventDate: event.eventDate,
        eventStartTime: event.eventStartTime,
        eventEndTime: event.eventEndTime,
        eventVenue: event.eventVenue,
        eventAddress: event.eventAddress,
        tickets: tickets.map(eventTicketResponse)
    };
};

export function eventTicketResponse(ticket: Ticket) {
    return {
        id: ticket.id,
        ticketType: ticket.ticketType,
        unitPrice: ticket.unitPrice,
        quantity: ticket.quantity,
        ticketImage: ticket.ticketImage,
    };
};