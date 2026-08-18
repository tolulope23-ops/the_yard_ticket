import { BaseEntity } from "@/shared/entities/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { User } from "./user.entity";
import { AuthProvider } from "../enum/auth-provider.enum";
import { UserAccount } from "./user-account.entity";


@Entity('auth_credentials')
@Unique(['provider', 'externalProviderId'])
@Unique(['accountId', 'provider'])
export class AuthCredential extends BaseEntity{
  @Index()
  @Column()
  accountId!: string;

  @Column({type: 'enum', enum: AuthProvider})
  provider!: AuthProvider;

  @Column({ nullable: true})
  externalProviderId?: string;

  @Column()
  identifier!: string;

  //If email is used for login
  @Column({ nullable: true, select: false })
  passwordHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  userAccount!: UserAccount;
};