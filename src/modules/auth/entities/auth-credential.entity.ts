import { BaseEntity } from "@/common/entities/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { AuthProvider } from "./auth-provider.entity";


@Entity('auth_credentials')
@Index(['providerId', 'identifier'], { unique: true })
export class auth_credential extends BaseEntity{
  @Column()
  userId!: string;

  @Column()
  providerId!: string;

  @Column()
  identifier!: string;

  @Column({ nullable: true, select: false })
  secret?: string;

  @Column({ default: true })
  isActive!: boolean;

  // @Column({ default: false })
  // mustChangePassword!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Index()
  @ManyToOne(() => AuthProvider, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'providerId' })
  provider!: AuthProvider;
};