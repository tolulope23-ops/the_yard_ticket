import { Column, Index, JoinColumn, ManyToOne, type Point } from "typeorm";
import { EventStatus } from "../enum/event-status.enum";
import { UserAccount } from "@/modules/auth/entities/user-account.entity";
import { EventCategory } from "../enum/event-category.enum";

export class Event {
    @Index()
    @Column()
    organiserAccountId!: string;

    @Column({type: 'varchar'})
    title!: string;

    @Column({type: 'text'})
    description!: string;

    @Column({type: 'enum', enum: EventCategory})
    eventCategory!: EventCategory;

    @Column({type: 'timestamptz'})
    eventStartTime!: Date;

    @Column({type: 'timestamptz'})
    eventEndTime!: Date;

    @Column({type: 'varchar'})
    eventVenue!: string;

    @Column({type: 'text'})
    address!: string

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: false })
    latitude!: string;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: false })
    longitude!: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false,
    })
    location!: object;

    @Index()
    @Column({type: 'enum', enum: EventStatus})
    eventStatus!:EventStatus;

    @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organiserAccountId' })
    organiserAccount!: UserAccount;
};