import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToMany } from "typeorm";
import { VerificationTokenType } from "../enum/verification-token-type.enum";
import { User } from "./user.entity";

@Entity('verification_tokens')
export class VerificationToken extends BaseEntity{
    @Index()
    @Column()
    userId!: string;

    @Column({select: false})
    tokenHash!: string;

    @Column({type: 'varchar'})
    type!: VerificationTokenType;

    @Index()
    @Column({type: 'timestamp'})
    expiresAt!: Date;

    @Column({type: 'timestamp', nullable: true})
    usedAt?: Date;

    @ManyToMany(() => User, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user!: User;
};