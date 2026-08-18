import { Entity, Column, Index } from "typeorm";
import { AccountStatus } from "../enum/account-status.enum";
import { AccountType } from "../enum/account-type.enum";
import { BaseEntity } from "@/shared/entities/base.entity";


@Entity('users')
export class User extends BaseEntity{
  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  phoneNumber!: string;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Index()
  @Column({ type: 'varchar', default: AccountStatus.PENDING })
  status!: AccountStatus;

  @Index()
  @Column({ type: 'varchar', default: AccountType.REGULAR_USER })
  accountType!: AccountStatus;

  // @OneToOne(() => UserProfile, (profile) => profile.user)
  // profile!: UserProfile;
};