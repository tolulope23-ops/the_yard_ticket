import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { TicketType } from "../enum/tickets-type.enum";
import { Event } from "@/modules/events/entities/events.entity";

@Entity('tickets')
@Index(['eventId', 'ticketType'], { unique: true })
export class Ticket{
    @Index()
    @Column()
    eventId!: string;

    @Column({type: 'enum', enum: TicketType})
    ticketType!: TicketType;

    @Index()
    @Column({type: 'numeric', precision: 12, scale: 2})
    unitPrice!: number;

    @Column({type: 'integer'})
    quantity!: number;

    @Column({type: 'integer'})
    quantityAvailable!: number;

    @Column({type: 'text'})
    bannerImage!: string;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'eventId' })
    event!: Event;
};