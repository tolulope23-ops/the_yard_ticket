import { Column, Entity, Index, JoinColumn, ManyToOne, Unique,} from "typeorm";
import { User } from "./user.entity";
import { AccountType } from "../enum/account-type.enum";
import { AccountStatus } from "../enum/account-status.enum";
import { BaseEntity } from "@/shared/entities/base.entity";

@Entity('user_accounts')
@Index(['userId', 'accountType'], { unique: true })
export class UserAccount extends BaseEntity{
    @Column()
    userId!: string;

    @Index()
    @Column({type: 'enum', enum: AccountType})
    accountType!: AccountType;

    @Index()
    @Column({type: 'varchar', default: AccountStatus.PENDING})
    status!: AccountStatus;

    @Column({ type: 'timestamptz', nullable: true })
    lastLoginAt?: Date;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    // @Index()
    // @OneToOne(() => UserProfile, (profile) => profile.userAccount,{ onDelete: 'CASCADE' })
    // profile!: UserProfile;
};