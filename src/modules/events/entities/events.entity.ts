import { Column, Entity, Index, JoinColumn, ManyToOne, type Point, } from "typeorm";
import { EventStatus } from "../enum/event-status.enum";
import { UserAccount } from "@/modules/auth/entities/user-account.entity";
import { EventCategory } from "../enum/event-category.enum";
import { BaseEntity } from "@/shared/entities/base.entity";

@Entity('events')
export class Event extends BaseEntity{
    @Index()
    @Column()
    organiserAccountId!: string;

    @Column({type: 'varchar', length: 200})
    title!: string;

    @Column({type: 'text', length: 250})
    description!: string;

    @Column({type: 'text', length: 250})
    eventBannerImage!: string;

    @Column({type: 'enum', enum: EventCategory})
    eventCategory!: EventCategory;

    @Column({ type: 'date' })
    eventDate!: string;

    @Column({ type: 'time'})
    eventStartTime!: string;

    @Column({ type: 'time', nullable: true })
    eventEndTime?: string;

    @Column({type: 'varchar', length: 250})
    eventVenue!: string;

    @Column({type: 'text', length: 250})
    eventAddress!: string

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: false })
    latitude!: string;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: false })
    longitude!: string;

    @Index({ spatial: true })
    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false,
    })
    eventLocation!: Point;

    @Index()
    @Column({type: 'enum', enum: EventStatus, default: EventStatus.PUBLISHED})
    eventStatus!: EventStatus;

    @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organiserAccountId' })
    organiserAccount!: UserAccount;
};