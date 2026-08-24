import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { TicketType } from "../enum/tickets-type.enum";
import { Event } from "@/modules/events/entities/events.entity";
import { BaseEntity } from "@/shared/entities/base.entity";

@Entity('tickets')
@Index(['eventId', 'ticketType'], { unique: true })
export class Ticket extends BaseEntity{
    @Index()
    @Column()
    eventId!: string;

    @Column({type: 'enum', enum: TicketType})
    ticketType!: TicketType;

    @Index()
    @Column({type: 'numeric', precision: 12, scale: 2})
    unitPrice!: number;

    @Column({type: 'integer', default: 0})
    quantity!: number;

    @Column({type: 'integer'})
    quantityAvailable!: number;

    @Column({type: 'integer', default: 0})
    quantitySold!: number;

    @Column({type: 'text', length: 250})
    ticketImage!: string;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'eventId' })
    event!: Event;
};